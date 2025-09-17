"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext("");

const UserInfoProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [user, setUser] = useState<string>("");

  useEffect(() => {
    const getUserInfo = async () => {
      const supabase = await createClient();
      try {
        const { data, error } = await supabase.auth.getClaims();

        const userData = data?.claims;

        if (error) {
          throw error;
        }
        setUser(userData?.email || "");
      } catch (error: unknown) {
        if (typeof error === "string") {
          console.log(error);
        } else if (error instanceof Error) {
          console.error("An error occured", error.message);
        }
      }
    };
    getUserInfo();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

const useUserInfo = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("User context was used outside the UserInfoProvider!");
  }
  return context;
};

export { UserInfoProvider, useUserInfo };
