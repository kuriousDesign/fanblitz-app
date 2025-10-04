import { signIn, signOut } from "@/auth";
import { Button } from '@/components/ui';
import { FaGoogle, FaFacebook } from "react-icons/fa6";




export function SignIn() {
	const hideFbBtn = true;
	return (
		<div className="flex flex-col space-y-4">
			<form
				action={async () => {
					"use server";
					await signIn("google");
				}}
			>
				<Button type="submit" className="bg-primary">
					<FaGoogle />
					Sign in using Google
				</Button>
			</form>
			
			{!hideFbBtn && <form
				action={async () => {
					"use server";
					await signIn("facebook");
				}}
			>
				<Button type="submit" className="bg-blue-600 text-white">
					<FaFacebook />
					Sign in using Facebook
				</Button>
			</form>}
		</div>
	);
}

export function SignOut({ children }: { children: React.ReactNode }) {
	return (
		<form
			action={async () => {
				"use server";
				await signOut();
                //redirect('/'); // Redirect to home page after sign out
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