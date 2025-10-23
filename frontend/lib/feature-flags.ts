// lib/feature-flags.ts

// Toggle these for UI testing without wiring real auth & DB.


export const LOGIN = true; 
//export const LOGIN = false; 





// When true, show the tab switch (All | My Reports) even if user has 0 reports.
// In production, set this to false so the switch appears only if the user has >= 1 report.


export const SHOW_TABS_FOR_EMPTY_USER = true;
//export const SHOW_TABS_FOR_EMPTY_USER = false;
