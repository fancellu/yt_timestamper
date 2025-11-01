import { extractVideoId, getVideoMetadata, getTranscript } from '../api/youtube.js';

async function runTests() {
  console.log('Running YouTube API Tests...\n');
  
  // Test 1: Extract video ID from standard URL
  const url1 = 'https://www.youtube.com/watch?v=r1O23tr-NFs';
  const id1 = extractVideoId(url1);
  console.log(`✓ Extract from standard URL: ${id1 === 'r1O23tr-NFs' ? 'PASS' : 'FAIL'}`);
  
  // Test 2: Extract video ID from shortened URL
  const url2 = 'https://youtu.be/r1O23tr-NFs';
  const id2 = extractVideoId(url2);
  console.log(`✓ Extract from shortened URL: ${id2 === 'r1O23tr-NFs' ? 'PASS' : 'FAIL'}`);
  
  // Test 3: Invalid URL
  const url3 = 'https://example.com/video';
  const id3 = extractVideoId(url3);
  console.log(`✓ Invalid URL returns null: ${id3 === null ? 'PASS' : 'FAIL'}`);
  
  // Test 4: Get video metadata
  console.log('\nFetching video metadata...');
  try {
    const metadata = await getVideoMetadata('r1O23tr-NFs');
    console.log(`  Video ID: ${metadata.videoId}`);
    console.log(`  Title: ${metadata.title}`);
    console.log(`  Duration: ${metadata.duration}`);
    
    const titleMatch = metadata.title.includes('People have found another clip');
    const durationMatch = metadata.duration === '2:16';
    
    console.log(`✓ Title contains expected text: ${titleMatch ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Duration is 2:16: ${durationMatch ? 'PASS' : 'FAIL'}`);
    
    // Test 5: Get transcript
    console.log('\nFetching transcript...');
    const transcript = await getTranscript('r1O23tr-NFs');
    console.log(`  Transcript segments: ${transcript.length}`);
    const transcriptMatch = transcript.length > 0;
    console.log(`✓ Transcript fetched: ${transcriptMatch ? 'PASS' : 'FAIL'}`);
    
    if (titleMatch && durationMatch && transcriptMatch) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

runTests();
