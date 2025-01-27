const socket = io({
    transports: ['websocket']
});

function addCard(username, profilePic, roomId) {

    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = roomId;
    card.innerHTML = `
          <img src="${profilePic}" alt="Profile Picture">
          <h3>${username}</h3>
          <a href='/room/${roomId}'>Join</a>
      `;
    cardList.appendChild(card);
}

function removeCard(card) {
    card.classList.add('removed');
    card.addEventListener('animationend', () => {
        card.remove();
    });
    console.log(document.getElementById('cardList').childElementCount, document.getElementById('cardList').lastChild)
}

socket.on('room-created', ({ roomId, user }) => {
    addCard(user.username, user.profilePic.replace('/public', ''), roomId)
})

socket.on('room-full', ({ roomId }) => {
    const card = document.querySelector('.card[data-id="' + roomId + '"]');
    console.log(card)
    removeCard(card);
})