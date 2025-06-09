// the point of this file is to provide helper functions for creating urls for links and navigation
//import { usePathname } from "next/navigation";

export function getLinks() {
    //const pathname = usePathname();

    const getHomeUrl = () => {
        return '/';
    };

    const getAdminUrl = () => {
        return '/admin';
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

    const getEventUrl = (eventId?: string) => {
        return `${getEventsUrl()}/${eventId || '_'}`;
    }

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
    }

    const getEditEventUrl = (eventId: string) => {
        return `${getEventUrl(eventId)}/edit`;
    }


    const getRacesUrl = (eventId: string) => {
        return `${getEventsUrl()}/${eventId}/races`;
    }

    const getRaceUrl = (eventId: string, raceId: string) => {
        return `${getRacesUrl(eventId)}/${raceId}`;
    }


    const getEditRaceUrl = (eventId: string, raceId: string) => {
        return `${getRacesUrl(eventId)}/${raceId}/edit`;
    }


    const getCreateRacerUrl = (eventId: string, raceId: string) => {
        return `${getRaceUrl(eventId, raceId)}/create-racer`;
    }

    const getCreateGameUrl = (eventId: string) => {
        return `${getEventUrl(eventId)}/create-game`;
    }
    const getCreateRaceUrl = (eventId: string) => {
        return `${getEventUrl(eventId)}/create-race`;
    }


    const getRaces = (eventId: string) => {
        return `${getEventUrl(eventId)}/races`;
    }

    const getGamePicksUrl = (gameId?: string) => {
        return `${getGameUrl(gameId)}/picks`;
    }

    const getPlayerPicksUrl = () => {
        return `${getDashboardUrl()}/picks`;
    }
    
    const getCreatePickUrl = (gameId: string) => {
        return `${getGameUrl(gameId)}/create-pick`;
    }

    const getCurrentPath = () => {
        // This function is a placeholder for the current path logic
        // In a real application, you would use a hook or context to get the current path
        return window.location.pathname;
    };

    return {
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
        getCurrentPath,
    };
}