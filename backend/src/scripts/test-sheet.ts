
import axios from 'axios';
import { parse } from 'csv-parse';

const SHEET_ID = '1eu3esnt3mE2aQabpBWVAjr4OzsGnJTDIY6NOQCNB8ik';
const GID = '421737196';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

const testSheet = async () => {
  console.log('Fetching CSV from:', CSV_URL);
  try {
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
      if (count === 0) {
        console.log('--- HEADERS FOUND ---');
        console.log(Object.keys(record));
        console.log('---------------------');
      }
      if (count < 3) {
        console.log(`--- ROW ${count + 1} ---`);
        console.log(record);
      }
      count++;
    }
    console.log(`Total rows found: ${count}`);

  } catch (error: any) {
    console.error('Error:', error.message);
  }
};

testSheet();
