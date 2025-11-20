import axios from 'axios';
import { parse } from 'csv-parse';
import MissingPerson, { PersonStatus, Gender, VerificationStatus } from '../models/MissingPerson';
import Location, { LocationType, LocationStatus } from '../models/Location';

const SHEET_ID = '1eu3esnt3mE2aQabpBWVAjr4OzsGnJTDIY6NOQCNB8ik';
const GID = '421737196';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

export const crawlSheetData = async () => {
  console.log('Starting sheet crawl job...');
  try {
    const response = await axios.get(CSV_URL, {
      responseType: 'stream'
    });

    const parser = response.data.pipe(parse({
      from_line: 1, // Headers are on the first line for this sheet
      columns: true, 
      trim: true,
      skip_empty_lines: true
    }));

    let count = 0;
    let newCount = 0;

    for await (const record of parser) {
      count++;
      
      // Handle different sheet formats
      let name = record['Tên'] || record['Họ tên'] || record['Người liên hệ'] || record['Chủ hộ'] || '';
      let address = record['Địa chỉ'] || record['Địa điểm'] || record['Nơi cần hỗ trợ'] || '';
      let phone = record['Thông tin liên lạc'] || record['SĐT'] || record['Số điện thoại'] || record['Điện thoại'] || '';
      const status = record['Tình trạng'] || record['Mức độ'] || '';
      const area = record['Chi tiết khu vực'] || record['Khu vực'] || record['Huyện/Xã'] || '';
      const peopleCount = record['Số người'] || '';
      const note = record['Ghi chú'] || record['Nội dung hỗ trợ'] || record['Cần hỗ trợ'] || '';

      // Logic for mixed content (if specific columns are empty but Note exists)
      if (!address && !phone && note) {
        // Try to extract phone
        const phoneMatch = note.match(/(?:SĐT|sđt|ĐT|đt|liên hệ|gọi)[:\s]*([0-9\.\s]{9,15})/i);
        if (phoneMatch) {
            phone = phoneMatch[1].replace(/\./g, '').trim();
        }

        // Use the part before the phone as address/description
        address = note.split(/(?:SĐT|sđt|ĐT|đt|liên hệ|gọi)/i)[0].trim();
        if (address.length > 200) address = address.substring(0, 200) + '...';
      }

      // Skip empty rows
      if (!address && !phone && !note) continue;

      // Construct description
      const description = `
        Địa chỉ: ${address}
        Khu vực: ${area}
        Số người: ${peopleCount}
        Ghi chú gốc: ${note}
        Tình trạng: ${status}
      `.trim();

      // Check for duplicates
      let exists = false;
      if (phone && phone.length > 5) {
        const existing = await MissingPerson.findOne({ 
            reporterPhone: phone,
            description: { $regex: 'Google Sheet', $options: 'i' }
        });
        if (existing) exists = true;
      } else {
        // If no phone, check exact address match
        const existing = await Location.findOne({ address: address, locationType: LocationType.USER_LOCATION });
        if (existing) exists = true;
      }

      if (!exists) {
        // Skip server-side geocoding to let client handle it
        const lat = 0;
        const lon = 0;

        // Create Location
        const newLocation = await Location.create({
          latitude: lat,
          longitude: lon,
          address: address || area || 'Chưa rõ địa chỉ',
          district: area,
          locationType: LocationType.USER_LOCATION,
          description: `Imported from Sheet. Area: ${area}`,
          reporterName: 'Google Sheet Bot',
          status: LocationStatus.ACTIVE
        });

        // Create MissingPerson Report
        await MissingPerson.create({
          reporterName: 'Google Sheet Bot',
          reporterPhone: phone || 'N/A',
          fullName: name || 'Chưa rõ',
          age: undefined,
          gender: Gender.UNKNOWN,
          description: description,
          lastKnownLocation: newLocation._id,
          lastSeenDate: new Date(),
          contactInfo: phone || 'N/A',
          status: PersonStatus.NEED_HELP,
          verificationStatus: VerificationStatus.UNVERIFIED,
          photoUrls: []
        });
        newCount++;
      }
    }

    console.log(`Crawl finished. Processed ${count} rows. Added ${newCount} new reports.`);

  } catch (error) {
    console.error('Error in crawl job:', error);
  }
};
