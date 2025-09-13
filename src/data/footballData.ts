export type WeekData = { weekNumber: number; startDate: string; endDate: string; };


export const seasonWeeksMap: { [key: number]: WeekData[] } = {
    2025: [
        { weekNumber: 1, startDate: '2025-08-26', endDate: '2025-09-02' },
        { weekNumber: 2, startDate: '2025-09-03', endDate: '2025-09-09' },    
        { weekNumber: 3, startDate: '2025-09-10', endDate: '2025-09-16' },
        { weekNumber: 4, startDate: '2025-09-17', endDate: '2025-09-23' },
        { weekNumber: 5, startDate: '2025-09-24', endDate: '2025-09-30' },
        { weekNumber: 6, startDate: '2025-10-01', endDate: '2025-10-07' },
        { weekNumber: 7, startDate: '2025-10-08', endDate: '2025-10-14' },
        { weekNumber: 8, startDate: '2025-10-15', endDate: '2025-10-21' },    
        { weekNumber: 9, startDate: '2025-10-22', endDate: '2025-10-28' },
        { weekNumber: 10, startDate: '2025-10-29', endDate: '2025-11-04' },
        { weekNumber: 11, startDate: '2025-11-05', endDate: '2025-11-11' },
        { weekNumber: 12, startDate: '2025-11-12', endDate: '2025-11-18' },
        { weekNumber: 13, startDate: '2025-11-19', endDate: '2025-11-25' },
        { weekNumber: 14, startDate: '2025-11-26', endDate: '2025-12-02' },
        { weekNumber: 15, startDate: '2025-12-03', endDate: '2025-12-09' },
        { weekNumber: 16, startDate: '2025-12-10', endDate: '2025-12-16' },
    ]
};



export function getWeeksForSeason(season: number) : WeekData[] {
    return seasonWeeksMap[season] || [];
}