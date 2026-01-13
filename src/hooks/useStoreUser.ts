import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export const useStoreUser = () => {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (user) {
      const storeUser = async () => {
        await createUser({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? "",
          name: user.fullName ?? undefined,
        });
      };
      
      storeUser();
    }
  }, [isLoaded, user, createUser]);

  return { user, isLoaded };
};