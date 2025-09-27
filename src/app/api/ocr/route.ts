export async function POST(request: Request) {
  try {
    console.log('=== OCR API DEBUG START ===');
    console.log('OCR API called');
    console.log('Content-Type:', request.headers.get('content-type'));
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    console.log('Image file received:', imageFile?.name, imageFile?.size);
    console.log('Image file type:', imageFile?.type);
    
    if (!imageFile) {
      console.log('ERROR: No image provided');
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    // For now, let's return a simple test response to verify the API is working
    console.log('=== RETURNING TEST DATA ===');
    
    const testData = {
      fullName: 'Test User',
      dateOfBirth: '01/01/1990',
      height: '5 feet 10 inches',
      weight: '175 lbs',
      age: 34,
      confidence: 95,
      rawText: 'TEST ID CARD\nTEST USER\nDOB: 01/01/1990\nHEIGHT: 5\'10"\nWEIGHT: 175 LBS'
    };

    console.log('=== OCR API DEBUG END ===');
    
    return Response.json({
      success: true,
      data: testData,
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return Response.json(
      { 
        error: 'Failed to process image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
