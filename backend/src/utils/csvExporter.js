import { Parser } from 'json2csv';

/**
 * Utility to convert JSON objects array into CSV text string
 */
export const exportToCSV = (data, fields = []) => {
  try {
    const json2csvParser = fields.length ? new Parser({ fields }) : new Parser();
    return json2csvParser.parse(data);
  } catch (error) {
    throw new Error(`CSV Generation Failed: ${error.message}`);
  }
};
