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
import { GameStates, gameStateToString } from '@/types/enums';
import { GameWeekClientType } from '@/models/GameWeek';
import { updateSpreadPicksScoresByGameWeek } from '@/actions/postScore';
import { postGameWeek } from '@/actions/postGameWeek';

export interface ActivateGameButtonProps {
    game: GameWeekClientType;
}

export default function BtnChangeGameWeekState({ game }: ActivateGameButtonProps) {
    return (
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
                    {Object.values(GameStates).map((state) => (
                        <SelectItem 
                            key={state} 
                            value={state} 
                            className={game.status === state ? "bg-primary" : ""}
                        >
                            {gameStateToString(state)}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}


