'use client';

//import { Button } from '@/components/ui';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GameStates } from '@/types/enums';
import { GameWeekClientType } from '@/models/GameWeek';
import { updateSpreadPicksScoresByGameWeek } from '@/actions/postScore';
import { postGameWeek } from '@/actions/postGameWeek';

export interface ActivateGameButtonProps {
    game: GameWeekClientType;
    state?: GameStates;
}

export default function BtnChangeGameWeekState({ game, state }: ActivateGameButtonProps) {
    //let buttonLabel = '';
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
                //buttonLabel = "Unknown State";
        }
    } else {
        if (game.status === state) {
            // If the game is already in the requested state, hide the button
            hideButton = true;
            return null; // No button to render
        }
    }
    // switch (state) {
    //     case GameStates.UPCOMING:
    //         buttonLabel = "Created";
    //         break;
    //     case GameStates.OPEN:
    //         buttonLabel = "Open";
    //         break;
    //     case GameStates.IN_PLAY:
    //         buttonLabel = "Activate";
    //         break;
    //     case GameStates.FINISHED:
    //         buttonLabel = "End";
    //         break;
    //     default:
    //         buttonLabel = "Unknown State";
    // }

    return (!hideButton &&
        // <Button
        //     variant='secondary'
        //     onClick={async () => {
        //         if(state === GameStates.FINISHED) {
        //             await updateSpreadPicksScoresByGameWeek(game._id as string);
        //         }
        //         const updatedGame = { ...game, status: state };
        //         await postGameWeek(updatedGame);
        //         window.location.reload();
        //     }}
        // >
        //     {buttonLabel}
        // </Button>
        <Select onValueChange={async (value) => {
            if (value === GameStates.FINISHED) {
                await updateSpreadPicksScoresByGameWeek(game._id as string);
            }
            const updatedGame = { ...game, status: value };
            await postGameWeek(updatedGame);
            window.location.reload();
        }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Game Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Game Status</SelectLabel>
                    <SelectItem value={GameStates.UPCOMING}>Upcoming</SelectItem>
                    <SelectItem value={GameStates.OPEN}>Open</SelectItem>
                    <SelectItem value={GameStates.IN_PLAY}>In Play</SelectItem>
                    <SelectItem value={GameStates.FINISHED}>Finished</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}


