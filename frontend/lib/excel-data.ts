// lib/excel-data.ts
import Excel from 'exceljs';

export interface CompanyDataRow {
  companyName: string;
  sector: string;
  e_score: number;
  s_score: number;
  g_score: number;
  positive: string;
  negative: string;
  controversy: string;
  grade: string;
  isin: string;
  esgScore: number;
  composite: number;
}

export interface FundDataRow {
  fundName: string;
  score: number;
  percentage: string;
  grade: string;
}

export interface PortfolioCompany {
  isin: string;
  aum: number;
  esgScore: number;
  companyName: string;
}

function headerIndexMap(worksheet: Excel.Worksheet) {
  const map: Record<string, number> = {};
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const text = (cell.value ?? '').toString().trim();
    if (text) map[text] = colNumber;
  });
  return map;
}

// Internal function to load workbook once
async function loadWorkbook(): Promise<Excel.Workbook | null> {
  try {
    const response = await fetch('/data.xlsx');
    if (!response.ok) throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);
    return workbook;
  } catch (error) {
    console.error('Failed to load Excel file:', error);
    return null;
  }
}

// Internal function to parse company sheet
function parseCompanySheet(workbook: Excel.Workbook): CompanyDataRow[] {
  try {
    const worksheet = workbook.getWorksheet('Company');
    if (!worksheet) throw new Error("Worksheet 'Company' not found.");

    const idx = headerIndexMap(worksheet);

    const get = (row: Excel.Row, headerName: string) => {
      const col = idx[headerName];
      if (!col) return '';
      const v = row.getCell(col).value;
      return v === null || v === undefined ? '' : v;
    };

    const data: CompanyDataRow[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const companyName = String(get(row, 'Company Name') || '').trim();
      const sector = String(get(row, 'Sector') || '').trim();
      const e_score = Number(get(row, 'E Pillar') || 0) || 0;
      const s_score = Number(get(row, 'S Pillar') || 0) || 0;
      const g_score = Number(get(row, 'G Pillar') || 0) || 0;
      const positive = String(get(row, 'Positive Screen') || '').trim();
      const negative = String(get(row, 'Negative Screen') || '').trim();
      const controversy = String(get(row, 'Controversy Rating') || '').trim();
      const grade = String(get(row, 'ESG Rating') || '').trim();
      const isin = String(get(row, 'ISIN') || '').trim();
      const esgScore = Number(get(row, 'ESG Pillar') || 0) || 0;
      const composite = Number(get(row, 'Composite Rating') || 0) || 0;

      if (companyName) {
        data.push({
          companyName,
          sector,
          e_score,
          s_score,
          g_score,
          positive,
          negative,
          controversy,
          grade,
          isin,
          esgScore,
          composite,
        });
      }
    });

    return data;
  } catch (error) {
    console.error('Failed to parse company data from Excel:', error);
    return [];
  }
}

// Internal function to parse fund sheet
function parseFundSheet(workbook: Excel.Workbook): FundDataRow[] {
  try {
    const worksheet = workbook.getWorksheet('Fund');
    if (!worksheet) throw new Error("Worksheet 'Fund' not found.");

    const idx = headerIndexMap(worksheet);
    const data: FundDataRow[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const fundName = String(row.getCell(idx['Fund Name'] || 1).value || '').trim();
      const score = Number(row.getCell(idx['Score'] || 2).value || 0) || 0;
      const percentage = String(row.getCell(idx['Percentage'] || 3).value || '').trim();
      const grade = String(row.getCell(idx['Grade'] || 4).value || '').trim();

      if (fundName) data.push({ fundName, score, percentage, grade });
    });

    return data;
  } catch (error) {
    console.error('Failed to parse fund data from Excel:', error);
    return [];
  }
}

// Cache for loaded data
let cachedData: { companies: CompanyDataRow[]; funds: FundDataRow[] } | null = null;

// Load both datasets once and cache them
async function loadAllData(): Promise<{ companies: CompanyDataRow[]; funds: FundDataRow[] }> {
  if (cachedData) return cachedData;

  const workbook = await loadWorkbook();
  if (!workbook) {
    return { companies: [], funds: [] };
  }

  const companies = parseCompanySheet(workbook);
  const funds = parseFundSheet(workbook);

  cachedData = { companies, funds };
  return cachedData;
}

// Public API - maintains same function signatures
export async function getCompanyData(): Promise<CompanyDataRow[]> {
  const data = await loadAllData();
  return data.companies;
}

export async function getFundData(): Promise<FundDataRow[]> {
  const data = await loadAllData();
  return data.funds;
}