import styled, { css } from "styled-components";
import SearchResult from "./SearchResult";

const Popover = css`
  max-height: 80vh;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  position: fixed;
  z-index: 12;
  left: 20px;
  top: 120px;
  margin-top: 0.5em;
  width: 80vw;
  max-width: 30em;
  box-shadow: 0 0 5px 0;
  padding: 1em;
  border-radius: 2px;
  background: ${({ theme }) => theme.background};
`;

export default styled(SearchResult)`
  display: ${props => (props.show ? `block` : `none`)};
  ${Popover}

  .HitCount {
    display: flex;
    justify-content: flex-end;
  }

  .Hits {
    ul {
      list-style: none;
      margin-left: 0;
    }

    li.ais-Hits-item {
      margin-bottom: 1em;

      a {
        color: ${({ theme }) => theme.foreground};

        h4 {
          margin-bottom: 0.2em;
        }
      }
    }
  }
`;