import { getConnectToDb, getUser } from '@/actions/getActions';
import { SignIn, SignOut } from '@/components/login';
export default async function Home() {
	await getConnectToDb();
	const user = await getUser();

	return (
		<div className="p-6 space-y-4 flex flex-col items-center justify-center">
			<h1 className="text-3xl font-bold text-center">Fan Blitz App</h1>
			<div className="max-w-2xl text-center space-y-4">
				<h3 className="text-xl font-bold text-green-500">
					WIN $100,000 with the FanBlitz Football Challenge!
				</h3>
				<p className="text-lg">
					Free to play. Make your game picks each week for a chance at $100k.
					You pick against the spread and if you get every game correct for the week, you win big!
				</p>
			</div>

			<div className="flex flex-col justify-center items-center">
				{user ? <SignOut>{''}</SignOut> : <SignIn />}
			</div>
		</div>
	);
}