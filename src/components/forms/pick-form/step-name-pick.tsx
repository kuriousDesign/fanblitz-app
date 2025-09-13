// basic data like your name and pick nickname
import { PickClientType } from '@/models/reference/Pick';
import { getRandomNicknameSuggestion } from './nicknameSuggestions';
import { BiRefresh } from 'react-icons/bi';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';


export default function StepNamePick({ pickForm, setPickForm }: {
  pickForm: PickClientType;
  setPickForm: React.Dispatch<React.SetStateAction<PickClientType>>;
}) {
  //const [nicknameSuggestion, setNicknameSuggestion] = useState("");


  const loadSuggestion = async () => {
    const suggestion = await getRandomNicknameSuggestion();
    console.log('suggestion', suggestion);
    setPickForm(prev => ({ ...prev, nickname: suggestion }));
  };


  return (
    <Card className=" h-full">
      <CardHeader className="">
        <CardTitle className="text-2xl font-bold">Name your pick</CardTitle>
        <CardDescription>
          Please provide your name and a nickname for your pick.
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="space-y-4  w-full">
          <div>
            <label className="block mb-2 font-medium">Your Name</label>
            <input
              type="text"
              value={pickForm.name}
              onChange={(e) => setPickForm(prev => ({ ...prev, name: e.target.value }))}
              className="border p-2 w-3/4 rounded"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Name this Pick</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pickForm.nickname}
                onChange={(e) => setPickForm(prev => ({ ...prev, nickname: e.target.value }))}
                className="border p-2 w-full rounded"
                placeholder='funny nickname for your pick'
              />
              <button
                onClick={loadSuggestion}
                className="p-2 rounded-full hover:bg-gray-100 border"
                type="button"
              >
                <BiRefresh className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
