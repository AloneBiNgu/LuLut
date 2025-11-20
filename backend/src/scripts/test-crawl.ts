import axios from 'axios';
import { parse } from 'csv-parse';

const SHEET_ID = '1eu3esnt3mE2aQabpBWVAjr4OzsGnJTDIY6NOQCNB8ik';
const GID = '788741575';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

async function fetchSheet() {
  try {
    console.log(`Fetching from ${CSV_URL}...`);
    const response = await axios.get(CSV_URL, {
      responseType: 'stream'
    });
    
    const parser = response.data.pipe(parse({
      from_line: 1,
      columns: true,
      trim: true,
      skip_empty_lines: true
    }));

    let count = 0;
    for await (const record of parser) {
        count++;
        if (count > 5) break; // Only check first 5 rows

        let address = record['Địa chỉ'] || '';
        let phone = record['Thông tin liên lạc'] || '';
        const note = record['Ghi chú'] || '';

        if (!address && !phone && note) {
            const phoneMatch = note.match(/(?:SĐT|sđt|ĐT|đt|liên hệ|gọi)[:\s]*([0-9\.\s]{9,15})/i);
            if (phoneMatch) {
                phone = phoneMatch[1].replace(/\./g, '').trim();
            }
            address = note.split(/(?:SĐT|sđt|ĐT|đt|liên hệ|gọi)/i)[0].trim();
        }

        console.log(`Row ${count}:`);
        console.log(`  - Address: ${address.substring(0, 50)}...`);
        console.log(`  - Phone: ${phone}`);
        console.log(`  - Note: ${note.substring(0, 50)}...`);
    }

  } catch (error: any) {
    console.error('Error fetching sheet:', error.message);
  }
}

fetchSheet();
