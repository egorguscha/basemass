const hasGameOnTheServerStarted = (contractRooms, serverName) => {
    const currentRoom = contractRooms.get(`"${serverName}"`);
    
    // Checking if the server has a finish_block
    const hasGameStarted = !currentRoom.finish_block.isZero();

    return hasGameStarted;
};

export default hasGameOnTheServerStarted;
