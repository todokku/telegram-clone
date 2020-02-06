import React, { useEffect } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { ME_QUERY, ALL_MESSAGES_QUERY } from "../../api/queries";

const StyledSideBarItem = styled.div`
  .active {
    background-color: ${props => props.theme.highlight};
  }
  .bubble {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 4rem;
    width: 4rem;
    background-color: ${props => props.color};
    border-radius: 50%;
    color: ${props => props.theme.text};
    font-weight: bold;
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-decoration: none;
    color: transparent;
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription MESSAGE_SUBSCRIPTION($chatId: ID!) {
    message(chatId: $chatId) {
      node {
        id
        text
        createdAt
        chatId
        from {
          id
          name
          color
        }
      }
    }
  }
`;

const SideBarItem = ({ chat, currentUserId }) => {
  const { subscribeToMore } = useQuery(ALL_MESSAGES_QUERY, {
    variables: { chatId: chat.id }
  });
  const { data: userData } = useQuery(ME_QUERY);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGE_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const newMessage = subscriptionData.data.message;

        if (newMessage.node.from.id === userData.me.id) return prev;

        const newMessages = {
          ...prev,
          messages: {
            __typename: prev.messages.__typename,
            pageInfo: prev.messages.pageInfo,
            edges: [...prev.messages.edges, newMessage]
          }
        };

        return newMessages;
      },
      variables: {
        chatId: chat.id
      }
    });

    return () => unsubscribe();
  }, [subscribeToMore, userData]);

  const getColor = int =>
    ["#BF616A", "#D08770", "#EBCB8B", "#A3BE8C", "#B48EAD"][int - 1];
  const otherUser = chat.users.find(user => user.id !== currentUserId);
  const color = getColor(otherUser.color);

  return (
    <StyledSideBarItem color={color}>
      <NavLink activeClassName="active" to={`/chat/${chat.id}`}>
        <div className="bubble">
          {otherUser.name.substring(0, 1).toUpperCase()}
        </div>
      </NavLink>
    </StyledSideBarItem>
  );
};

export default SideBarItem;
