import styled from "styled-components";
import SearchBox from "./SearchBox";

export default styled(SearchBox)`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  margin-bottom: 0;
  padding: 0 10px;

  .SearchInput {
    outline: none;
    font-size: 1em;
    transition: 100ms;
    border-radius: 4px;
    border: 1px solid black;
    color: ${({ theme }) => theme.foreground};
    ::placeholder {
      color: ${({ theme }) => theme.faded};
    }
    width: 100%;
    background: ${({ theme }) => theme.background};
    cursor: text;
    margin-left: -1.6em;
    padding-left: 2em;
  }

  .SearchIcon {
    width: 1em;
    margin: 0.3em;
    color: ${({ theme }) => theme.foreground};
    pointer-events: none;
  }
`;