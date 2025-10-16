// import { sendEmailInvite } from '@/actions/emailActions';
import { getConnectToDb, getCurrentPlayer } from '@/actions/getActions';
import CopyInviteLinkButton from '@/components/buttons/CopyInviteLinkButton';
// import ServerActionButton from '@/components/buttons/ServerActionButton';
export default async function EarnPicksPage() {
    await getConnectToDb();
    const player = await getCurrentPlayer();

    //const friendEmail = 'gardner.761@gmail.com';

    // const sendEmailAction = async () => {
    //     "use server";
    //     if (!player || !player._id) {
    //         throw new Error('No player found');
    //     }
    //     // send to a test email for now
    //     //const email = formData.get('email') as string;

    //     await sendEmailInvite('gardner.761@gmail.com');
    // };

    return (
        <div className="p-6 space-y-4 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-center">Earn Free Picks!</h1>
            <div className="max-w-2xl text-center space-y-4">
                <h3 className="text-xl font-bold text-green-500">
                    Send an invite to a friend and earn free picks when they sign up!
                </h3>
                <p className="text-lg">
                    Send an email invite to a friend. When they sign up, you earn one free pick!
                    You can use up to three free picks per week.
                </p>
            </div>
             <CopyInviteLinkButton playerId={player?._id as string} />

            {/* <div className="flex flex-row justify-center items-center gap-2">
                <form action={sendEmailAction} className="w-full max-w-md flex gap-2">
                    <div className="flex-1">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter friend's email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <ServerActionButton label="Send Invite" serverAction={sendEmailAction} />
                </form>
            </div> */}
        </div>
    );
}