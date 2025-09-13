import { NextResponse } from 'next/server'
import { DriverModel } from '@/models/reference/Driver'
import connectToDb from '@/lib/db'
import mongoose from 'mongoose'


export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Received JSON:', body)
        return NextResponse.json({ message: 'JSON received successfully' })
    } catch (error) {
        console.error('Error processing JSON:', error)
        return NextResponse.json({ error: 'Failed to process JSON' }, { status: 400 })
    }
}

export const GET = async () => {
    try {
        await connectToDb()

        if (!mongoose.connection.db) {
        throw new Error('Database connection not established')
        }
        
        const data = await DriverModel.find()
        //console.log('GET /api --> DriverModels: ', data)

        return NextResponse.json(data)
    } catch (error) {
        console.error('API GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch DriverModels' }, { status: 500 })
    }
}