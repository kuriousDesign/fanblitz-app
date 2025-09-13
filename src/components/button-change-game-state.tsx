'use client';

import { Button } from '@/components/ui';
import { postGame } from '@/actions/postActions';
import { GameClientType } from '@/models/reference/Game';
import { GameStates } from '@/types/enums';
import { calculateHardChargersLeaderboardByGameId } from '@/actions/scoreActions';

export interface ActivateGameButtonProps {
    game: GameClientType;
    state?: GameStates;
}

export default function BtnChangeGameState({ game, state }: ActivateGameButtonProps) {
    let buttonLabel = '';
    let hideButton = false;
    //let advanceNextState = false;
    if (!state) {
        //advanceNextState = true;
        switch (game.status) {
            case GameStates.UPCOMING:
                state = GameStates.OPEN;
                break;
            case GameStates.OPEN:
                state = GameStates.IN_PLAY;
                break;
            case GameStates.IN_PLAY:
                state = GameStates.FINISHED;
                break;
            case GameStates.FINISHED:
                state = GameStates.FINISHED;
                hideButton = true; // No further action possible
                break;
  
            default:
                buttonLabel = "Unknown State";
        }
    } else {
        if(game.status === state){
            // If the game is already in the requested state, hide the button
            hideButton = true;
            return null; // No button to render
        }
    }
    switch (state) {
        case GameStates.UPCOMING:
            buttonLabel = "Created";
            break;
        case GameStates.OPEN:
            buttonLabel = "Open";
            break;
        case GameStates.IN_PLAY:
            buttonLabel = "Activate";
            break;
        case GameStates.FINISHED:
            buttonLabel = "End";
            break;
        default:
            buttonLabel = "Unknown State";
    }

    return (!hideButton &&
        <Button
            variant='secondary'
            onClick={async () => {
                if(state === GameStates.FINISHED) {
                    await calculateHardChargersLeaderboardByGameId(game._id as string);
                }
                const updatedGame = { ...game, status: state };
                await postGame(updatedGame);
                window.location.reload();
            }}
        >
            {buttonLabel}
        </Button>
    );
}