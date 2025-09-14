import { getConnectToDb, getUser } from '@/actions/getActions';
import { SignIn, SignOut } from '@/components/login';
export default async function Home() {
	await getConnectToDb();
	const user = await getUser();
	const tagline = 'login then make some picks';

	return (
		<div className="p-6 space-y-4 flex flex-col items-center justify-center">
			<h1 className="text-3xl font-bold text-center">Fan Blitz App</h1>
			<h2 className="text-2xl font-bold text-center">{tagline}</h2>
			<div className="flex flex-col justify-center items-center">
				{user ? <SignOut>{''}</SignOut> : <SignIn />}
			</div>
		</div>
	);
}