// create an enum of GameStates 
export enum GameStates {
    UPCOMING = 'created',
    OPEN = 'open',
    IN_PLAY = 'in_play',
    FINISHED = 'finished'
}

export function gameStateToString(state: GameStates): string {
    switch (state) {
        case GameStates.UPCOMING:
            return 'Upcoming';
        case GameStates.OPEN:
            return 'Open';
        case GameStates.IN_PLAY:
            return 'In Play';
        case GameStates.FINISHED:
            return 'Finished';
        default:
            return 'Unknown State';
    }
}

export enum GameTypes {
    HYBRID = 'hybrid',
    TOP_FINISHER = 'top_finisher',
    HARD_CHARGER = 'hard_charger',
    CLASSIC_DRAW = 'classic_draw',
}

export function gameTypesToString(type: GameTypes): string {
    switch (type) {
        case GameTypes.HYBRID:
            return 'Hybrid';
        case GameTypes.TOP_FINISHER:
            return 'Top Finisher';
        case GameTypes.HARD_CHARGER:
            return 'Hard Charger';
        case GameTypes.CLASSIC_DRAW:
            return 'Classic Draw';
        default:
            return 'Unknown Type';
    }
}

export enum RaceStates {
    LINEUP = 'lineup',
    RACING = 'racing',
    FINISHED = 'finished'
}

export function raceStatesToString(state: RaceStates): string {
    switch (state) {
        case RaceStates.LINEUP:
            return 'Lineup';
        case RaceStates.RACING:
            return 'Racing';
        case RaceStates.FINISHED:
            return 'Finished';
        default:
            return 'Unknown State';
    }
}

export enum Roles {
    USER = 'user',
    ADMIN = 'admin',
}