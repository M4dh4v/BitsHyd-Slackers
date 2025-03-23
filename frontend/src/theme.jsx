import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      900: "#1a365d",
      800: "#153e75",
      700: "#2a69ac",
    },
    lightGray: "#E2E8F0",
    lightPurple: "#B794F4",
    darkBlue: "#0A192F",
    teal: "#319795",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "darkBlue" : "lightGray",
        color: props.colorMode === "dark" ? "grey.200" : "black",
      },
    }),
  },
});

export default theme;
