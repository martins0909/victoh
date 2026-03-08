import express from 'express';
import axios from 'axios';
import Ercaspay from '@capitalsage/ercaspay-nodejs';

const router = express.Router();

// Validate Ercaspay configuration
const ECRS_SECRET_KEY = process.env.ECRS_SECRET_KEY;
const ECRS_API_BASE = process.env.ECRS_API_BASE || 'https://api.ercaspay.com';
if (!ECRS_SECRET_KEY || ECRS_SECRET_KEY.trim() === '') {
  console.error('FATAL: ECRS_SECRET_KEY is not set in environment variables!');
}

// Initialize Ercaspay client - MUST use baseURL (uppercase) not baseUrl
const ercaspay = new Ercaspay({
  baseURL: ECRS_API_BASE,
  secretKey: (ECRS_SECRET_KEY || '').trim(),
});

/**
 * POST /api/payments/ercas/initiate
 * Creates a new payment checkout session with Ercaspay
 */
router.post('/ercas/initiate', async (req, res) => {
  try {
    const { amount, currency = 'NGN', userId, email, callbackUrl } = req.body;

    // Validate required fields
    if (!amount || !userId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, userId, email',
      });
    }

    // Generate unique payment reference
    const paymentReference = ercaspay.generatePaymentReferenceUuid();

    // Build redirect URL to return customer to /shop with our paymentReference in query
    const baseRedirect = (callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop`).toString();
    const redirectUrlWithRef = baseRedirect.includes('?')
      ? `${baseRedirect}&pref=${encodeURIComponent(paymentReference)}`
      : `${baseRedirect}?pref=${encodeURIComponent(paymentReference)}`;

    // Prepare transaction data
    const transactionData = {
      amount: String(amount),
      paymentReference,
      paymentMethods: 'card,bank-transfer,ussd',
      customerName: 'Customer', // You can enhance this by getting actual customer name
      customerEmail: email,
      currency: currency.toUpperCase(),
      customerPhoneNumber: '', // Optional - can be added to frontend form
      redirectUrl: redirectUrlWithRef,
      description: `Wallet top-up for user ${userId}`,
      feeBearer: 'merchant',
      metadata: {
        userId,
        type: 'wallet-topup',
      },
    };

    // Optional: light debug for transaction (avoid logging secrets)
    console.log('Ercaspay initiateTransaction called', {
      paymentReference,
      amount: String(amount),
      currency: currency.toUpperCase(),
      hasSecretKey: Boolean(ECRS_SECRET_KEY && ECRS_SECRET_KEY.length > 0)
    });

    // Call Ercaspay API
    // Use direct Axios call to ensure headers are correct and handle errors better
    let response;
    try {
        const cleanKey = (ECRS_SECRET_KEY || '').trim();
        const axiosRes = await axios.post(
            `${ECRS_API_BASE}/api/v1/payment/initiate`,
            transactionData,
            {
                headers: {
                    'Authorization': `Bearer ${cleanKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        response = {
            requestSuccessful: true,
            responseBody: axiosRes.data.responseBody,
            responseMessage: axiosRes.data.responseMessage
        };
    } catch (err: any) {
        console.error("Ercaspay Initiate Error (Axios):", err.response?.data || err.message);
        if (err.response?.status === 401) {
             return res.status(401).json({
                success: false,
                error: "Invalid Ercaspay Secret Key. Please check your .env file.",
             });
        }
        throw { 
            message: err.response?.data?.errorMessage || err.message, 
            responseData: err.response?.data 
        };
    }

    // Check if transaction was successful
    if (response.requestSuccessful && response.responseBody) {
      const { checkoutUrl } = response.responseBody;
      
      // Log full response to see what Ercaspay returns
      console.log('Ercaspay response body:', JSON.stringify(response.responseBody, null, 2));
      
      // Ercaspay verifyTransaction expects the paymentReference we sent, not a separate transactionReference
      // We'll return our paymentReference for verification
      const transactionReference = response.responseBody.transactionReference
        || response.responseBody.transactionRef
        || response.responseBody.reference
        || null;

      // Try to record a pending payment in DB (best-effort; don't block response)
      try {
        const { Payment } = await import('../models');
        await Payment.create({
          userLocalId: (transactionData as any).metadata?.userId,
          email: transactionData.customerEmail,
          amount: Number(transactionData.amount) || 0,
          method: 'ercaspay',
          status: 'pending',
          reference: paymentReference,
          transactionReference: transactionReference || undefined,
        });
      } catch (e) {
        console.warn('Payment DB record (pending) failed:', (e as Error).message);
      }

      return res.status(200).json({
        success: true,
        checkoutUrl,
        paymentReference, // our internally generated UUID
        transactionReference, // gateway provided reference for verification
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.responseMessage || 'Failed to create payment session',
      });
    }
  } catch (error: any) {
    console.error('Error creating payment session:', error);
    console.error('Error details:', {
      message: error.message,
      responseData: error.responseData,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    return res.status(500).json({
      success: false,
      error: error.responseData?.responseMessage || error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/payments/verify
 * Verifies a payment transaction status
 */
router.get('/verify', async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    // Sanitize reference in case provider appended their own query after our value
    const cleanReference = String(reference).split('?')[0].split('&')[0].trim();

    console.log('=== Verify Payment ===');
    console.log('Verifying reference:', cleanReference);

    // Call Ercaspay API
    const response = await ercaspay.verifyTransaction(cleanReference);

    console.log('Ercaspay verify response:', JSON.stringify({
      requestSuccessful: response.requestSuccessful,
      responseCode: response.responseCode,
      responseMessage: response.responseMessage,
      responseBody: response.responseBody,
    }, null, 2));

    // Check verification response
    if (response.requestSuccessful && response.responseBody) {
      const transactionData = response.responseBody;

      // Map Ercaspay response codes to our status
      let status = 'pending';
      if (response.responseCode === 'success') {
        status = 'success';

        // Credit the user if not already credited
        try {
            const { Payment, User } = await import('../models');
            const amount = Number(transactionData.amount || 0);
            const transRef = transactionData.transactionReference || cleanReference;
            
            // Find payment
            let payment = await Payment.findOne({ 
                $or: [{ transactionReference: transRef }, { reference: cleanReference }] 
            });

            if (payment && payment.isCredited) {
                // Already credited
                const user = await User.findById(payment.user);
                return res.status(200).json({
                    success: true,
                    status: 'success',
                    amount,
                    newBalance: user?.balance,
                    alreadyCredited: true,
                    reference: cleanReference,
                    data: transactionData,
                });
            }

            // If not credited, credit now
            if (amount > 0) {
                // Ensure payment record exists
                if (!payment) {
                    payment = new Payment({
                        userLocalId: transactionData.metadata?.userId,
                        email: transactionData.customerEmail,
                        amount,
                        method: 'ercaspay',
                        status: 'completed',
                        transactionReference: transRef,
                        reference: cleanReference,
                        isCredited: false
                    });
                } else {
                    payment.status = 'completed';
                    payment.amount = amount;
                }

                // Find user to credit
                const userId = payment.user || payment.userLocalId || transactionData.metadata?.userId;
                if (userId) {
                    const user = await User.findByIdAndUpdate(
                        userId,
                        { $inc: { balance: amount } },
                        { new: true }
                    );
                    
                    if (user) {
                        payment.isCredited = true;
                        payment.user = user._id as any;
                        await payment.save();
                        
                        return res.status(200).json({
                            success: true,
                            status: 'success',
                            amount,
                            newBalance: user.balance,
                            reference: cleanReference,
                            data: transactionData,
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Error crediting in verify:", e);
        }
      } else if (response.responseCode === 'failed') {
        status = 'failed';
      }

      return res.status(200).json({
        success: true,
        status,
        amount: transactionData.amount || 0,
  reference: cleanReference,
        data: transactionData,
      });
    } else {
      console.log('Ercaspay verify failed, checking DB fallback...');
      // Fallback: if gateway says not found, check DB if webhook already marked it completed
      try {
        const { Payment } = await import('../models');
        const paid = await Payment.findOne({
          $or: [{ transactionReference: cleanReference }, { reference: cleanReference }],
          status: 'completed',
        }).lean();
        if (paid) {
          console.log('Found completed payment in DB:', paid._id);
          return res.status(200).json({
            success: true,
            status: 'success',
            amount: paid.amount,
            reference: cleanReference,
            data: { source: 'webhook-cache' },
          });
        } else {
          console.log('No completed payment found in DB for reference:', reference);
        }
      } catch (e) {
        console.warn('DB lookup fallback failed:', (e as Error).message);
      }

      return res.status(400).json({
        success: false,
        error: response.responseMessage || 'Failed to verify payment',
        status: 'failed',
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.responseData?.responseMessage || error.message || 'Internal server error',
      status: 'failed',
    });
  }
});

/**
 * POST /api/payments/webhook
 * Ercaspay webhook endpoint to receive transaction updates
 * Note: For production, verify signatures if the provider supports it.
 */
router.get('/webhook', (req, res) => {
  res.status(200).json({ status: "active", message: "Webhook endpoint is operational. Send POST requests here." });
});

router.post('/webhook', async (req, res) => {
  try {
    const evt = req.body || {};
    
    // Extract reference from various possible fields (snake_case or camelCase)
    const reference: string | undefined = 
      evt.transaction_reference || 
      evt.payment_reference || 
      evt.transactionReference || 
      evt.reference || 
      evt.transactionRef || 
      evt?.data?.reference;

    const statusRaw: string = (evt.status || evt.event || evt?.data?.status || '').toString().toLowerCase();
    const metadata = evt.metadata || evt?.data?.metadata || {};
    const email = evt.customerEmail || evt?.data?.customer?.email || metadata?.email || undefined;

    console.log('Webhook received:', { reference, status: statusRaw, amount: evt.amount });

    if (!reference) {
      console.warn('Webhook without reference:', evt);
      return res.status(200).json({ received: true });
    }

    // Confirm with gateway to avoid spoofing
    const verifyResp = await ercaspay.verifyTransaction(reference);
    if (verifyResp.requestSuccessful && verifyResp.responseBody) {
      const transactionData = verifyResp.responseBody;
      const code = verifyResp.responseCode;
      const success = code === 'success' || statusRaw === 'successful' || statusRaw === 'success';
      const amt = Number(transactionData.amount || evt.amount || 0);

      try {
        const { Payment, User } = await import('../models');
        
        // 1. Find existing payment using either transaction reference or payment reference
        // We check both because reference could be either
        let payment = await Payment.findOne({ 
          $or: [
            { transactionReference: reference }, 
            { reference: reference },
            { reference: evt.payment_reference },
            { transactionReference: evt.transaction_reference }
          ] 
        });

        // 2. Check if already credited
        if (payment && payment.isCredited) {
          console.log('Webhook: Payment already processed and credited:', reference);
        } else {
          // 3. Process if success
          if (success && amt > 0) {
            // Ensure payment record exists or update it
            if (!payment) {
              payment = new Payment({
                userLocalId: metadata?.userId,
                email,
                amount: amt,
                method: 'ercaspay',
                status: 'completed',
                transactionReference: evt.transaction_reference || reference,
                reference: evt.payment_reference || transactionData.paymentReference || reference, 
                isCredited: false
              });
            } else {
              payment.status = 'completed';
              payment.amount = amt;
              // Ensure transaction refs are set
              if (!payment.transactionReference && evt.transaction_reference) {
                payment.transactionReference = evt.transaction_reference;
              }
              if (payment.status !== 'completed') payment.status = 'completed';
            }

            // 4. Find user and credit balance
            const userId = payment.user || payment.userLocalId || metadata?.userId;
            
            if (userId) {
               const user = await User.findByIdAndUpdate(
                  userId,
                  { $inc: { balance: amt } },
                  { new: true }
               );

               if (user) {
                  payment.isCredited = true;
                  payment.user = user._id as any;
                  await payment.save();
                  console.log(`Webhook: Successfully credited user ${userId} amount ${amt}`);
               } else {
                  console.warn(`Webhook: User ${userId} not found, payment marked completed but not credited`);
                  await payment.save(); 
               }
            } else {
               console.warn('Webhook: No user ID linked to payment, saved as uncredited');
               await payment.save();
            }
          } else if (!success) {
             // Handle failed/pending updates if record exists
             if (payment) {
                payment.status = 'failed';
                await payment.save();
             }
          }
        }
      } catch (e) {
        console.error('Failed to process Payment in webhook:', (e as Error).message);
      }
    } else {
      console.warn('Gateway verification failed in webhook:', verifyResp.responseMessage);
    }

    // Always acknowledge to prevent retries storms; adjust if provider expects different codes
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ received: true });
  }
});

/**
 * GET /api/payments/status/:reference
 * Fetches detailed transaction status (alternative to verify)
 */
router.get('/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    // Fetch transaction details
    const response = await ercaspay.fetchTransactionDetails(reference);

    if (response.requestSuccessful && response.responseBody) {
      return res.status(200).json({
        success: true,
        data: response.responseBody,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.responseMessage || 'Failed to fetch transaction status',
      });
    }
  } catch (error: any) {
    console.error('Error fetching transaction status:', error);
    return res.status(500).json({
      success: false,
      error: error.responseData?.responseMessage || error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/payments/ercas/credit
 * Verifies payment and credits user balance
 */
router.post('/ercas/credit', async (req, res) => {
  try {
    const { userId, email, transRef, status, amount } = req.body;
    
    if (!userId || !transRef) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    console.log(`Crediting payment: ${transRef} for user ${userId}`);

    // Verify with Ercaspay
    const verifyResp = await ercaspay.verifyTransaction(transRef);
    
    if (!verifyResp.requestSuccessful || !verifyResp.responseBody || verifyResp.responseCode !== 'success') {
       console.error("Verification failed:", verifyResp);
       return res.status(400).json({ ok: false, error: "Payment verification failed with gateway" });
    }

    const verifiedAmount = Number(verifyResp.responseBody.amount);
    
    if (isNaN(verifiedAmount) || verifiedAmount <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid verified amount" });
    }

    const { Payment, User } = await import('../models');

    // Check if already credited
    let payment = await Payment.findOne({ 
        $or: [{ transactionReference: transRef }, { reference: transRef }] 
    });

    if (payment && payment.isCredited) {
        const user = await User.findById(payment.user || userId);
        return res.json({ 
            ok: true, 
            credited: false, 
            alreadyProcessed: true, 
            amount: payment.amount, 
            newBalance: user?.balance 
        });
    }

    // Update or create payment record
    if (!payment) {
        payment = new Payment({
            user: userId,
            userLocalId: userId,
            email,
            amount: verifiedAmount,
            method: 'ercaspay',
            status: 'completed',
            transactionReference: transRef,
            reference: verifyResp.responseBody.paymentReference || transRef,
            isCredited: false
        });
    } else {
        payment.status = 'completed';
        payment.amount = verifiedAmount; // Ensure amount matches verified
    }

    // Credit user
    const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: verifiedAmount } },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ ok: false, error: "User not found" });
    }

    payment.isCredited = true;
    payment.user = user._id as any; // Ensure user link
    await payment.save();

    console.log(`Credited ${verifiedAmount} to user ${userId}. New balance: ${user.balance}`);

    return res.json({
        ok: true,
        credited: true,
        amount: verifiedAmount,
        newBalance: user.balance
    });

  } catch (error: any) {
    console.error('Error crediting payment:', error);
    return res.status(500).json({
        ok: false,
        error: error.message || "Internal server error"
    });
  }
});

export default router;
