'use server'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getGameWeek } from './getMatchups';

import { GameWeekClientType } from '@/models/GameWeek';
import { getGameWeekPlayerPickTables } from './getTables';
import { PlayerPickTable } from '@/types/globals';
const axios = await import('axios');


interface GameWeekReportData {
  gameWeek: GameWeekClientType;
  playerPickTables: PlayerPickTable[];
}

/**
 * Generates a PDF report with player pick tables for a specific game week
 * @param gameWeekId - The ID of the game week to generate the report for
 * @returns Buffer containing the PDF data
 */
export async function generateGameWeekPicksReport(gameWeekId: string, playerPickTables: PlayerPickTable[]): Promise<Buffer> {
  try {
    // Fetch game week data
    const gameWeek = await getGameWeek(gameWeekId);
    if (!gameWeek) {
      throw new Error(`Game week with ID ${gameWeekId} not found`);
    }
    const reportData: GameWeekReportData = {
      gameWeek,
      playerPickTables,
    };

    const pdfBuffer = await createGameWeekPDF(reportData);
    return pdfBuffer;

  } catch (error) {
    console.error('Error generating game week picks report:', error);
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a PDF document with game week picks data
 * @param data - The game week report data
 * @returns Promise<Buffer> containing the PDF
 */
export async function createGameWeekPDF(data: GameWeekReportData): Promise<Buffer> {
  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();

  let y = height - 50; // start near the top

  // Title
  page.drawText(`Game Week Report: ${data.gameWeek.name}`, {
    x: 50,
    y,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  y -= 40;

  // Loop through all player pick tables
  data.playerPickTables.forEach((table) => {
    // Table title
    page.drawText(table.tableTitle, { x: 50, y, size: 14, font });
    y -= 25;

    // Table header
    const headers = table.tableHeads.join(' | ');
    page.drawText(headers, { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 18;

    // Table rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table.tableRowData.forEach((row: Record<string, any>) => {
      const text = Object.values(row).join(' | ');
      page.drawText(text, { x: 50, y, size: 10, font });
      y -= 14;
    });

    y -= 30;
  });

  // Convert to Buffer (for email or download)
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}


// export async function conver gameweek pick tables to plain text
export async function convertGameWeekPickTablesToText(data: GameWeekReportData): Promise<Buffer> {
  let reportText = `Game Week Report: ${data.gameWeek.name}\n\n`;
    data.playerPickTables.forEach((table) => {
    reportText += `Table: ${table.tableTitle}\n`;
    reportText += `${table.tableHeads.join(' | ')}\n`;
    table.tableRowData.forEach((row) => {
      reportText += `${Object.values(row).join(' | ')}\n`;
    });
    reportText += `\n`;
  });
  return Buffer.from(reportText, 'utf-8');
};


// create a function that takes in pdfBuffer and sends it to a make.com webhook
export async function sendGameWeekReportToMakeWebhook(
  week: number,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    const makeWebhookUrl = process.env.MAKE_API_URL;
    const makeApiKey = process.env.MAKE_API_KEY;
    if (!makeWebhookUrl) throw new Error('MAKE_API_URL is not configured.');
    if (!makeApiKey) throw new Error('MAKE_API_KEY is not configured.');

    // Make expects files as an array of objects
    const filePayload = [
      {
        filename: `GameWeek_${week}_Report.txt`,
        mime: 'text/plain',
        data: pdfBuffer.toString('utf-8'),
      },
    ];

    // Send JSON to Make webhook
    const response = await axios.default.post(
      makeWebhookUrl,
      {
        week,
        files: filePayload, // send as array
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-make-apikey': makeApiKey,
        },
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Make webhook error: ${response.statusText}`);
    }

    console.log('Report sent to Make webhook successfully');
    return true;
  } catch (error) {
    console.error('Error sending report to Make webhook:', error);
    throw new Error(
      `Failed to send report: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


export async function sendGameWeekReport(gameWeekId: string): Promise<boolean> {
  try {
    const gameWeek = await getGameWeek(gameWeekId);
    if (!gameWeek) {
      throw new Error(`Game week with ID ${gameWeekId} not found`);
    }
    const playerPickTables = await getGameWeekPlayerPickTables(gameWeekId);
    //const pdfBuffer = await generateGameWeekPicksReport(gameWeekId, playerPickTables);
    const buffer = await convertGameWeekPickTablesToText({ gameWeek, playerPickTables });
    await sendGameWeekReportToMakeWebhook(gameWeek.week, buffer);
    return true;

  } catch (error) {
    console.error('Error in sendGameWeekReportToMakeWebhook:', error);
    throw new Error(`Failed to send report to Make webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}