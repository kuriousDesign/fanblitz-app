import { handlePickFormSubmit } from '@/actions/postActions';
import { Button } from '@/components/ui';
import { PickClientType } from '@/models/reference/Pick';
import { toast } from 'sonner';
import { GameClientType } from '@/models/reference/Game';
//import { RacerDriverClientType } from '@/models/Racer';


export default function StepSubmit({
  game,
  //racerDrivers,
  pickForm,
}: {
  game: GameClientType;
  //racerDrivers: RacerDriverClientType[];
  pickForm: PickClientType;
}) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Submit</h2>
        <Button
          className="mt-4 px-6 py-2 bg-secondary text-secondary-foreground"
          onClick={async () => {
            try {
              handlePickFormSubmit(pickForm, game._id as string);
              toast.success("Pick submitted successfully!");
              //router.push(`/games/${gameId}`);
            } catch (error) {
              console.error('Error submitting pick:', error);
              toast.error("Failed to submit pick. Please try again.");
            }
          }
          }
        >
          Submit Pick
        </Button>
        
        <p className='mt-8'>
          After submitting, then you will pay
        </p>
        {/* <pre className="p-4 rounded text-left text-xs overflow-auto">
          {JSON.stringify(pickForm, null, 2)}
        </pre> */}

      </div>
    );
  }
