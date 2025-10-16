import { getCurrentPlayer, getUser } from "@/actions/getActions";
import { postFreePickToPlayer, postNewPlayerWithUser } from "@/actions/postActions";
import { signIn, signOut } from "@/auth";
import { Button } from '@/components/ui';
import { DefaultUser } from "@auth/core/types";
import { redirect } from "next/navigation";
import { FaGoogle, FaFacebook } from "react-icons/fa6";

interface SignInProps {
	inviterId?: string; // optional inviter ID
}

export function SignIn({ inviterId }: SignInProps) {
	const hideFbBtn = true;

	return (
		<div className="flex flex-col space-y-4">
			<form
				action={async () => {
					"use server";

					// Pass inviterId to your signIn function if present
					await signIn("google");
					const user = await getUser();

					if (!user || !user.id) {
						console.error('No user found, redirecting to sign in', user);
						return;
					}

					const player = await getCurrentPlayer();
					if (!player || !player._id) {
						await postNewPlayerWithUser(user as DefaultUser);
						console.log('Created new player for user', user);
						if (inviterId) {
							await postFreePickToPlayer(inviterId);
						}
					}
				}}
			>
				<Button type="submit" className="bg-primary">
					<FaGoogle />
					Sign in using Google
				</Button>
			</form>

			{!hideFbBtn && (
				<form
					action={async () => {
						"use server";
						await signIn("facebook");
						const user = await getUser();

						if (!user || !user.id) {
							console.error('No user found, redirecting to sign in', user);
							return;
						}

						const player = await getCurrentPlayer();
						if (!player || !player._id) {
							await postNewPlayerWithUser(user as DefaultUser);
							console.log('Created new player for user', user);
							if (inviterId) {
								await postFreePickToPlayer(inviterId);
							}
						}
					}}
				>
					<Button type="submit" className="bg-blue-600 text-white">
						<FaFacebook />
						Sign in using Facebook
					</Button>
				</form>
			)}
		</div>
	);
}

export function SignOut({ children }: { children: React.ReactNode }) {
	return (
		<form
			action={async () => {
				"use server";
				await signOut();
				redirect('/'); // Redirect to home page after sign out
			}}
			className="flex flex-col items-center justify-center space-y-4"
		>
			<p>{children}</p>

			<Button type="submit" className="bg-secondary text-secondary-foreground">
				Sign Out
			</Button>
		</form>
	);
}
