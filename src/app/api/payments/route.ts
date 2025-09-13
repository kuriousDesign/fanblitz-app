import { NextResponse } from 'next/server'
import { PaymentClientType } from '@/models/reference/Payment'
//import { postPayment } from '@/actions/postActions'

export async function POST(request: Request) {
  try {
    const payment = await request.json() as PaymentClientType;
    console.log('Received payment data:', payment)
    // Validate the body structure if necessary
    // Example: if (!body.name || !body.amount) throw new Error('Invalid payment data')

    // Call the postPayment function with the validated body
    //await postPayment(payment);

    // Return a successful response with the created payment
    return NextResponse.json({message: 'Payment processed successfully'}, { status: 200 })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }

}