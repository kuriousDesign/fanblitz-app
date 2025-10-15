export function getLinks() {

    const getHomeUrl = () => {
        return '/';
    };

    const getAdminUrl = () => {
        return '/admin';
    };

    const getPlayersUrl = () => {
        return `${getAdminUrl()}/players`;
    }

    const getDashboardUrl = () => {
        return '/dashboard';
    };

    const getDriversUrl = () => {
        return '/drivers';
    };
    const getEventsUrl = () => {
        return '/events';
    };

    const getGameWeeksUrl = () => {
        return '/gameweeks';
    }
    const getSeasonsUrl = () => {
        return '/seasons';
    }

    const getEarnPicksUrl = () => {
        return '/earn-picks';
    }

    const getTermsUrl = () => {
        return '/terms';
    }

    const getGameWeekUrl = (gameWeekId?: string) => {
        return `${getGameWeeksUrl()}/${gameWeekId || '_'}`;
    }

    const getEditGameWeekUrl = (gameWeekId: string) => {
        return `${getGameWeekUrl(gameWeekId)}/edit`;
    }

    const getCreateGameWeekUrl = () => {
        return `${getGameWeeksUrl()}/create`;
    }
            
    const getMakePicksUrl = () => {
        return '/make-picks';
 
    }

    const getEventUrl = (eventId?: string) => {
        return `${getEventsUrl()}/${eventId || '_'}`;
    };

    const getDriverUrl = (driverId: string) => {
        return `${getDriversUrl()}/${driverId}`;
    };

    const getCreateDriverUrl = () => {
        return `${getDriversUrl()}/create`;
    };

    const getEditDriverUrl = (driverId: string) => {
        return `${getDriversUrl()}/${driverId}/edit`;
    };

    const getGamesUrl = () => {
        return '/games';
    };

    const getGameUrl = (gameId?: string) => {
        return `${getGamesUrl()}/${gameId || '_'}`;
    };

    const getCreateEventUrl = () => {
        return `${getEventsUrl()}/create`;
    };

    const getEditEventUrl = (eventId: string) => {
        return `${getEventUrl(eventId)}/edit`;
    };


    const getRacesUrl = (eventId: string) => {
        return `${getEventsUrl()}/${eventId}/races`;
    };

    const getRaceUrl = (eventId: string, raceId: string) => {
        return `${getRacesUrl(eventId)}/${raceId}`;
    };


    const getEditRaceUrl = (eventId: string, raceId: string) => {
        return `${getRacesUrl(eventId)}/${raceId}/edit`;
    };

    const getCreateRacerUrl = (eventId: string, raceId: string) => {
        return `${getRaceUrl(eventId, raceId)}/create-racer`;
    };

    const getCreateGameUrl = (eventId: string) => {
        return `${getEventUrl(eventId)}/create-game`;
    }
    const getCreateRaceUrl = (eventId: string) => {
        return `${getEventUrl(eventId)}/create-race`;
    };

    const getRaces = (eventId: string) => {
        return `${getEventUrl(eventId)}/races`;
    };

    const getGamePicksUrl = (gameId?: string) => {
        return `${getGameUrl(gameId)}/picks`;
    };

    const getPlayerPicksUrl = () => {
        return `${getDashboardUrl()}/picks`;
    };

    const getCreatePickUrl = (gameId: string) => {
        return `${getGameUrl(gameId)}/create-pick`;
    };


    const getPicksByGameUrl = (gameId: string) => {
        return `${getGameUrl(gameId)}/picks`;
    };

    const getPickByGameUrl = (gameId: string, pickId: string) => {
        return `${getPicksByGameUrl(gameId)}/${pickId}`;
    };

    const getGameRaceUrl = (gameId: string, raceId: string) => {
        return `${getGameUrl(gameId)}/${raceId}`;
    };

    const getUpdateRaceStandingsUrl = (gameId: string, raceId: string) => {
        return `${getGameRaceUrl(gameId, raceId)}/update`;
    }

    return {
        getPlayersUrl,
        getTermsUrl,
        getEarnPicksUrl,
        getSeasonsUrl,
        getMakePicksUrl,
        getGameWeekUrl,
        getGameWeeksUrl,
        getEditGameWeekUrl,
        getCreateGameWeekUrl,
        getAdminUrl,
        getCreateEventUrl,
        getCreateRaceUrl,
        getCreateGameUrl,
        getHomeUrl,
        getEventsUrl,
        getEventUrl,
        getDriversUrl,
        getDriverUrl,
        getCreateDriverUrl,
        getEditDriverUrl,
        getGamesUrl,
        getDashboardUrl,
        getCreateRacerUrl,
        getRacesByEventUrl: getRaces,
        getRaceUrl,
        getEditRaceUrl,
        getRacesUrl,
        getGamePicksUrl,
        getPlayerPicksUrl,
        getCreatePickUrl,
        getGameUrl,
        getEditEventUrl,
        getPicksByGameUrl,
        getPickByGameUrl,
        getGameRaceUrl,
        getUpdateRaceStandingsUrl,
    };
}