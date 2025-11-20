import { Router } from 'express';
import { crawlSheetData } from '../jobs/sheetCrawler';

const router = Router();

// In-memory cooldown to prevent spamming Google Sheets
// Note: In serverless, this resets if the instance is recycled, but helps with bursts.
let lastCrawlTime = 0;
const CRAWL_COOLDOWN = 10 * 60 * 1000; // 10 minutes

const handleCrawl = async (req: any, res: any) => {
  const now = Date.now();
  const timeSinceLastCrawl = now - lastCrawlTime;

  if (timeSinceLastCrawl < CRAWL_COOLDOWN) {
    console.log(`Crawl skipped. Cooldown active (${Math.round((CRAWL_COOLDOWN - timeSinceLastCrawl) / 1000)}s remaining).`);
    return res.status(200).json({ 
        message: 'Crawl skipped (cooldown active).',
        nextCrawlAvailable: new Date(lastCrawlTime + CRAWL_COOLDOWN).toISOString()
    });
  }

  try {
    lastCrawlTime = now; // Set timestamp immediately to block concurrent requests
    console.log('Starting crawl job...');
    await crawlSheetData();
    res.status(200).json({ message: 'Crawl job completed successfully.' });
  } catch (error: any) {
    console.error('Crawl failed:', error);
    lastCrawlTime = 0; // Reset cooldown on error
    res.status(500).json({ message: 'Failed to run crawl job.', error: error.message });
  }
};

router.post('/', handleCrawl);
router.get('/', handleCrawl); // Support GET for Vercel Cron

export default router;
