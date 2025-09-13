import { GameClientType } from '@/models/reference/Game';
import { RaceClientType } from '@/models/reference/Race';

import { numberToOrdinal } from '@/utils/helpers';

export function HardChargerScoring({ game, races }: { game: GameClientType, races: RaceClientType[] }) {

  const includedRacesBlurb = races.length > 1 
    ? races.map((race) => `${race.letter} ${race.type}`).join(', ')
    : races.map((race) => `${race.letter} ${race.type}`)[0] || '';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg text-left">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡ Hard Charger Scoring Summary</h2>
      <p className="text-gray-600 mb-4">
        Hard Charger scoring is based on a wager (prediction) of how many cars you think the driver will pass and their actual performance. If they exceed your prediction, you only get the points you predicted. If they pass fewer cars, a penalty is applied to the points they earned you. 
      </p>

      <p className="text-gray-600 mb-4">
    
        You will select {game.num_hard_chargers} drivers and predict how many cars they will pass over the course of the night. Races included as follows: {includedRacesBlurb}.
        <br />
        <br />
        Each driver can earn you points or lose you points, depending on if they passed more cars than passed them for the night.
        <br />
        Driver scores are added together to give your total &quot;hard charger&quot; score.
      </p>

            <p className="text-purple-600 mt-4">
        The scoring system incentivizes accurate or slightly conservative predictions over ambitious ones, with perfect accuracy or being the optimal strategy.
     
      </p>
      <br />

                <span>
            <strong>Cars Passed Calculation for Multiple Races</strong> 
            <br />
            The number of cars passed in a single race is calculated by subtracting the finishing position from the starting position.
            <br />
            <code className='text-orange-600'> CarsPassedInRace = StartingPosition - FinalPosition</code>
            <br />
            <br />
            The total number of cars passed is the sum of cars passed from  all included races: {includedRacesBlurb}.
            <br />
            <code className='text-orange-600'> TotalCarsPassed = CarsPassedInRace1 + CarsPassedInRace2 ... </code>
   
          </span>

      <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Scoring Logic</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li className="flex items-start">
            <span className="mr-2 text-blue-500"></span>

        </li>

        <li className="flex items-start">
            <span className="mr-2 text-red-500">⬇️</span>
          <span>
            <strong>More cars passed them</strong> (TotalCarsPassed &lt;= 0):
            <br />
            If number of passed cars is less than zero, you will lose points (negative points), otherwise you will be eligible to earn points (read further).
            <br />
            <code className='text-orange-600'> Driver Score = -TotalCarsPassed</code>
          </span>
        </li>

        <li className="flex items-start">
          <span className="mr-2 text-green-500">🎯</span>
          <span>
            <strong>Perfect Prediction</strong> (TotalCarsPassed = Prediction):
            <br />
            Gets the full prediction value plus a bonus of {game.hard_charger_prediction_bonus} points
            <br />
            <code className='text-orange-600'> Driver Score = TotalCarsPassed + {game.hard_charger_prediction_bonus}</code>
          </span>
        </li>

        <li className="flex items-start">
          <span className="mr-2 text-green-500">📈</span>
          <span>
            <strong>Overperformed</strong> (TotalCarsPassed &gt; Prediction):
            <br />
            The scored is capped at the prediction value; there is no benefit for overperforming.
            <br />
            <code className='text-orange-600'> Driver Score = Prediction </code> 
          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-yellow-500">📉</span>
          <span>
            <strong>Underperformed</strong> (0 &lt; TotalCarsPassed &lt; Prediction):
            <br />
            The strength (scale factor) of the penalty is determined by how many cars you predicted.
            <br />
             <code className='text-orange-600'>PenaltyScale = Prediction X {game.hard_charger_prediction_scale} </code>
            <br />
            The penalty is also affected by how far off the prediction was.
            <br />
            <code className='text-orange-600'>Driver Score = TotalCarsPassed -  PenaltyScale X (Prediction - TotalCarsPassed)</code> (floored at 0)
          </span>
        </li>
 
      </ul>
      <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-2">Scoring Example</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-semibold text-gray-800 mb-3">
          Scenario: A driver passes 5 cars total across all races
        </p>
        <div className="space-y-3 text-sm">
          <div className="bg-green-100 p-3 rounded">
            <strong>Prediction: 5 cars (Perfect Match)</strong>
            <br />
            Driver Score = 5 + {game.hard_charger_prediction_bonus} = <strong>{5 + game.hard_charger_prediction_bonus} points</strong>
          </div>
          
          <div className="bg-blue-100 p-3 rounded">
            <strong>Prediction: 3 cars (Overperformed)</strong>
            <br />
            Driver Score = 3 (capped at prediction) = <strong>3 points</strong>
          </div>
          
            <div className="bg-yellow-100 p-3 rounded">
            <strong>Prediction: 8 cars (Underperformed)</strong>
            <br />
            PenaltyScale = 8 × {game.hard_charger_prediction_scale} = {(8 * game.hard_charger_prediction_scale).toFixed(2)}
            <br />
            Driver Score = 5 - {(8 * game.hard_charger_prediction_scale).toFixed(2)} × (8 - 5) = 5 - {(8 * game.hard_charger_prediction_scale * 3).toFixed(2)} = <strong>{(5 - (8 * game.hard_charger_prediction_scale * 3)).toFixed(2)} points</strong>
            </div>
            
            <div className="bg-orange-100 p-3 rounded">
            <strong>Prediction: 12 cars (Large Underperformance)</strong>
            <br />
            PenaltyScale = 12 × {game.hard_charger_prediction_scale} = {(12 * game.hard_charger_prediction_scale).toFixed(2)}
            <br />
            Driver Score = 5 - {(12 * game.hard_charger_prediction_scale).toFixed(2)} × (12 - 5) = 5 - {(12 * game.hard_charger_prediction_scale * 7).toFixed(2)} = <strong>{(5 - (12 * game.hard_charger_prediction_scale * 7)).toFixed(2)} points</strong>
            <br />
            <em className="text-gray-600">Note: Since this result is negative, the final score is floored at 0 points.</em>
            </div>
        </div>
      </div>

    </div>
  );
}

export function HardChargerScoringDeprecated({ game, races }: { game: GameClientType, races: RaceClientType[] }) {
  return (
    <>
      <div>
        <p>{`You will select ${game.num_hard_chargers} drivers and predict how many cars they will pass over the course of the night. Only races designated in this game are included:`}</p>
        <ul className="list-disc pl-6">
          {races.map((race: RaceClientType, index: number) => (
            <li key={index}>{race.letter} {race.type}</li>
          ))}
        </ul>
        <br />
        <p> Scoring is based on the total number of cars passed, not race by race.</p>
        <br />
        <p> If more cars pass your driver than they pass, you lose a point per car. </p>

        <br />


        <div>If they pass more cars than pass them, you will receive points as follows:
          <ul className="pl-6 space-y-1 list-disc">
            <li>they outperformed your prediction, you will only be credited with your prediction!</li>
            <li>your prediction was spot-on: you will receive a {game.hard_charger_prediction_bonus} bonus points in addition to the points you predicted</li>
            <li>they passed less than you predicted, penalty points will be removed from how many they actually passed! (see below)</li>
          </ul>
        </div>


      </div>

      <p className="font-light text-gray-400">
        Example: if a fast driver starts in 4th in the B main and finishes 1st, they will get 3 points for the B main, and if they start in 17th in the A main and finish in 19th, they will get -2 points for the A main, for a total of 1 point.
      </p>
      <p className='text-red-400'>
        Prediction Penalty Points
      </p>
      <p>
        {`You will predict how many cars each driver will pass over the course of the night. If you are wrong, (${game.hard_charger_prediction_scale} x prediction) points will be added for every car you were off by. Your score for that driver will be the If penalty exceeds the number of cars passed, you will earn zero points.`}
      </p>
    </>
  );
}

export function TopFinisherScoring({ game }: { game: GameClientType }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg text-left">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🏁 Top Finishers Scoring Summary</h2>
      <p className="text-gray-600 mb-4">
        Choose drivers for the top {game.num_top_finishers} finishing positions of the A Main.
        <br />
        <br />Each driver will earn you points and will be added together to give your total &quot;top finishers&quot; score.
      </p>

      <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Driver Scoring</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        <li className="flex items-start">
          <span className="mr-2 text-green-500"></span>
          <span>
            <strong>Baseline Points</strong> - Each driver selection starts with a baseline of {game.top_finisher_baseline_points} points, and then a bonus or penalty will be added based on prediction.
            <br />


          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-green-500">🎯</span>
          <span>
            <strong>Perfect Prediction Bonus</strong> - When the predicted position exactly matches final position, receive a bonus based on the position.
            Larger bonus for 1st place than decreasingly smaller bonuses for lower positions. Here are the bonus points:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>1st place prediction bonus: {game.num_top_finishers} points</li>
              {game.num_top_finishers >= 2 && <li>2nd place: {game.num_top_finishers - 1} points</li>}
              <li>... and so on, decreasing by 1 point per position</li>
              <li>{numberToOrdinal(game.num_top_finishers)} place bonus: 1 point</li>
            </ul>
            <code> Driver Score = {game.top_finisher_baseline_points} points + bonus points</code>


          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 text-green-500">📈</span>
          <span>
            <strong>Outperformed Bonus</strong> - When driver finishes better than predicted (e.g. predicted 3rd, finished 1st), receive a half-point bonus per position.
            <br />
            <p className="text-gray-500 font-light">
              <code> Driver Score = {game.top_finisher_baseline_points} + 0.5 X PositionDifference </code>
              <br />
              <br />
              Example: You guessed 3rd but they finished 1st, which makes a position difference of 2.
              <br />


              ExampleScore = {game.top_finisher_baseline_points} + 0.5 X 2 = {game.top_finisher_baseline_points + 1} points
            </p>


          </span>
        </li>

        <li className="flex items-start">
          <span className="mr-2 text-yellow-500">📉</span>
          <span>
            <strong>Underperformed Penalty</strong> - When driver finishes worse than predicted (e.g. predicted 1st, finished 3rd). For large penalties, driver score cannot go below 0.
            <br />
            <code> Driver Score = {game.top_finisher_baseline_points} - 1.0 X PositionDifference </code>

            <br />
            <p className="text-gray-500 font-light">
              <br />
              Example: You guessed 1st but they finished 3rd, which makes a position difference of 2.
              <br />
              ExampleScore = {game.top_finisher_baseline_points} - 1.0 X 2 = {game.top_finisher_baseline_points - 1 * 2} points
            </p>
          </span>
        </li>

      </ul>

      <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-2">Key Features</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-600">

        <li>Position-based bonuses reward accurate predictions of top positions more heavily</li>
        <li>Asymmetric penalties - underperforming hurts more than outperforming helps</li>

      </ul>

    </div>
  );
}