// app/sign-up/invite/[playerId]/page.tsx
import { getPlayer, getUser } from "@/actions/getActions";
import { LinkButton } from "@/components/LinkButton";
import { SignIn } from '@/components/login';

export default async function InviteSignUpPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  console.log('InviteSignUpPage playerId:', playerId);
  const user = await getUser(); // might be null
  const invitePlayer = await getPlayer(playerId);
  //console.log('InviteSignUpPage user:', user);
  //console.log('InviteSignUpPage invitePlayer:', invitePlayer);

  // const addFreePick = async () => {
  //   "use server";
  //   await postFreePickToPlayer(invitePlayer._id as string);
  // };

  if (!user?.id) {
    // allow page to render, maybe show a message: "Sign in to join"
    return (
      <div className="max-w-md mx-auto mt-12 p-6">
        <h1 className="text-2xl font-bold mb-4">Join Fan Blitz!</h1>
        <p className="text-gray-600">
          You were invited by player <span className="font-mono">{invitePlayer?.name}</span>.
        </p>
        <p className="mt-4 text-red-600">Please sign in to accept the invitation.</p>
        <div className="flex flex-col justify-center items-center">
          <SignIn inviterId={playerId} />
        </div>
      </div>
    );
  } else {
    // User is already signed in, redirect to dashboard or show message
    return (
      <div className="max-w-md mx-auto mt-12 p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-gray-600">
          You were invited by player <span className="font-mono">{invitePlayer?.name}</span>.
        </p>
        <p className="mt-4 text-green-600">You can now join the game!</p>
        <LinkButton href={`/dashboard`} className="mt-4">
          Go Play
        </LinkButton>
        {/* <ServerActionButton serverAction={addFreePick} label="Claim Free Pick" /> */}
      </div>
    );
  }
}
