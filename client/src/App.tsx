import { AppShell, Box, Header, Navbar, ScrollArea } from "@mantine/core";
import { Graph } from "./plot/Graph";
import { Menu } from "./Menu";
import { User } from "./User";
import "./App.css";

export const App = () => {
  return (
    <>
      <Menu />
      <Header
        style={{ marginBottom: 50 }}
        height={60}
        p="xs"
        className="appHeader"
      >
        <img src="/logo.gif" alt="cryptopus logo" /> Cryptopus
      </Header>

      <Graph />
    </>
  );
};
