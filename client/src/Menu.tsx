import { Box, Burger, Drawer, Header, Navbar, ScrollArea } from "@mantine/core";
import react, { useState } from "react";
import { User } from "./User";

export const Menu = () => {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Burger
        style={{
          position: "fixed",
          top: 10,
          left: 10,
        }}
        opened={opened}
        onClick={() => setOpened((o) => !o)}
        title={"menu"}
      />
      <Drawer
        transition="rotate-left"
        transitionDuration={250}
        transitionTimingFunction="ease"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <Header height={60} p="xs" className="appHeader">
          <img src="/logo.png" alt="cryptopus logo" /> Cryptopus
        </Header>

        <Box py="md">links</Box>

        <User />
      </Drawer>
    </>
  );
};
