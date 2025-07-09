import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Call the backend API
    const response = await fetch('http://localhost:4000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Backend returned non-JSON response:', await response.text());
      return NextResponse.json(
        { message: 'Backend server error - invalid response format' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || 'Signup failed' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { message: 'Network error - unable to connect to backend server' },
      { status: 500 }
    );
  }
} 