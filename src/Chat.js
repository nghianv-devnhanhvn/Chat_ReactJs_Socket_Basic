import React, {useEffect, useState} from 'react';
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({socket, username, room}) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    //typing
    // const [isTyping, setIsTyping] = useState(false);
    // const [timeTyping, setTimeTyping] = useState("");
    const [typingUser, setTypingUser] = useState([]);

    var isTyping = false, timeTyping = "";

    const sendMessage = async () => {
        if(currentMessage !== ""){
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() +
                    ":" +
                    new Date(Date.now()).getMinutes()
            };

            await socket.emit("send_message", messageData)
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };


    // typing
    const timeoutFunction = (messageData, isEmit = false) =>{
        // setIsTyping(false);
        isTyping = false;
        if(isEmit){
            messageData = {...messageData, isTyping}
            socket.emit('is_typing', messageData);
        }
    }

    const onKeyDownNotEnter = () => {
        var messageData = {
            room: room,
            author: username,
            message: currentMessage,
        };
        if(!isTyping) {
            // setIsTyping(true);
            isTyping = true;
            messageData = {...messageData, isTyping}
            socket.emit('is_typing',messageData);
            timeTyping = setTimeout(() => {
                timeoutFunction(messageData,  true);
            }, 5000)
        } else {
            clearTimeout(timeTyping);
            timeoutFunction(messageData);
        }
    }


    useEffect(() => {
        // socket.on("receive_message", (data) => {
        //     setMessageList((list) => [...list, data])
        // });
        const eventListener = (data) => {
            setMessageList((list) => [...list, data]);
        };
        socket.on("receive_message", eventListener);

        return () => socket.off("receive_message", eventListener);
    }, [socket]);


    useEffect(() => {
        const eventListener = (data) => {
            setTypingUser((list) => [...list, data]);
        }
        socket.on("is_typing", eventListener);

        return () => socket.off("is_typing", eventListener);
    }, [socket]);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <p>Live Chat</p>
            </div>
            <div className="chat-body">
                <ScrollToBottom className="message-container">
                {messageList.map((messageContent, index) => {
                    return( <div className="message" id={username === messageContent.author ? "you": "other"} key={index}>
                        <div>
                            <div className="message-content">
                                <p>{messageContent.message}</p>
                            </div>
                            <div className="message-meta">
                                <p id="time">{messageContent.time}</p>
                                <p id="author">{messageContent.author}</p>
                            </div>
                        </div>
                    </div>
                );
                })}
                    {
                        typingUser.slice(-1).filter(typing=>typing.isTyping).map((typing, index) => {
                            return (<span key={index} className="font-size-sm">{typing.author} đang trả lời...</span>)
                    })}

                </ScrollToBottom>
            </div>
            <div className="chat-footer">
                <input type="text"
                       value={currentMessage}
                       placeholder="hey..."
                       onChange={(event) => {
                           setCurrentMessage(event.target.value);
                           // typing
                           }}
                       onKeyPress={(event) => {
                           event.key === "Enter" && sendMessage();

                           event.key !== "Enter" && onKeyDownNotEnter();
                       }}

                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>

        </div>
    );
}

export default Chat;