"""
Simple script to demonstrate Excel data extraction without Django models
This can be run to test Excel reading functionality before running migrations
"""

import os
import pandas as pd

def analyze_excel_data():
    """Analyze the Excel file structure and content"""
    
    # Path to the Excel file
    excel_path = os.path.join('..', 'frontend', 'public', 'data.xlsx')
    
    if not os.path.exists(excel_path):
        print(f"Excel file not found at: {excel_path}")
        return
    
    try:
        # Read Excel file
        print("Reading Excel file...")
        df = pd.read_excel(excel_path)
        
        # Display basic info
        print(f"Excel file contains {len(df)} rows and {len(df.columns)} columns")
        print("\nColumn names:")
        for i, col in enumerate(df.columns, 1):
            print(f"{i}. {col}")
        
        print(f"\nFirst few rows:")
        print(df.head())
        
        # Show data types
        print(f"\nData types:")
        print(df.dtypes)
        
        # Show sample data for each column
        print(f"\nSample data for each column:")
        for col in df.columns:
            sample_values = df[col].dropna().head(3).tolist()
            print(f"{col}: {sample_values}")
            
        return df
        
    except Exception as e:
        print(f"Error reading Excel file: {str(e)}")
        return None

def suggest_model_mapping(df):
    """Suggest how columns map to Company and Fund models"""
    if df is None:
        return
    
    print("\n" + "="*50)
    print("SUGGESTED MODEL MAPPING")
    print("="*50)
    
    # Analyze column names to suggest Company vs Fund fields
    company_keywords = ['company', 'ticker', 'sector', 'market', 'revenue', 'esg', 'environmental', 'social', 'governance']
    fund_keywords = ['fund', 'aum', 'expense', 'inception', 'manager', 'benchmark']
    
    company_columns = []
    fund_columns = []
    unclear_columns = []
    
    for col in df.columns:
        col_lower = col.lower()
        is_company = any(keyword in col_lower for keyword in company_keywords)
        is_fund = any(keyword in col_lower for keyword in fund_keywords)
        
        if is_company and not is_fund:
            company_columns.append(col)
        elif is_fund and not is_company:
            fund_columns.append(col)
        else:
            unclear_columns.append(col)
    
    print("Likely Company fields:")
    for col in company_columns:
        print(f"  - {col}")
    
    print("\nLikely Fund fields:")
    for col in fund_columns:
        print(f"  - {col}")
    
    print("\nUnclear/Generic fields:")
    for col in unclear_columns:
        print(f"  - {col}")

if __name__ == "__main__":
    print("Analyzing Excel data structure...")
    df = analyze_excel_data()
    suggest_model_mapping(df)