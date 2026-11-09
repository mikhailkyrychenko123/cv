(() => {
  const baseRoute = [[0, 3], [1, 3], [1, 2], [2, 2], [2, 1], [3, 1], [3, 0]];
  const deadEndBranch = [[0, 2], [0, 1]];
  const moves = {
    'x-1': [-1, 0],
    'y-1': [0, -1],
    'y+1': [0, 1],
    'x+1': [1, 0]
  };

  function keyOf(x, y) {
    return `${x},${y}`;
  }

  function rotate(point, turns) {
    let [x, y] = point;
    for (let i = 0; i < turns; i += 1) [x, y] = [3 - y, x];
    return [x, y];
  }

  function mount(root, callbacks = {}) {
    const map = root?.querySelector('[data-delivery-map]');
    const deliveryStatus = root?.querySelector('[data-delivery-status]');
    const resetButton = root?.querySelector('[data-delivery-reset]');
    const localNote = root?.querySelector('[data-delivery-local-note]');
    const moveButtons = [...(root?.querySelectorAll('[data-delivery-move]') || [])];
    if (!root || !map || !deliveryStatus) return null;

    let delivery = null;
    let solved = false;

    function createDelivery() {
      const turns = Math.floor(Math.random() * 4);
      const route = baseRoute.map(point => rotate(point, turns));
      const branch = deadEndBranch.map(point => rotate(point, turns));
      const roadCells = new Set([...route, ...branch].map(([x, y]) => keyOf(x, y)));
      return {
        roadCells,
        start: route[0],
        goal: route[route.length - 1],
        history: [route[0]]
      };
    }

    function currentPosition() {
      return delivery.history[delivery.history.length - 1];
    }

    function drawMap() {
      if (!delivery) return;
      const current = currentPosition();
      const currentKey = keyOf(current[0], current[1]);
      const startKey = keyOf(delivery.start[0], delivery.start[1]);
      const goalKey = keyOf(delivery.goal[0], delivery.goal[1]);
      const tiles = [];

      for (let y = 0; y < 4; y += 1) {
        for (let x = 0; x < 4; x += 1) {
          const key = keyOf(x, y);
          const isRoad = delivery.roadCells.has(key);
          const isCurrent = key === currentKey;
          const isStart = key === startKey;
          const isGoal = key === goalKey;
          const icon = isCurrent ? '🚚' : isGoal ? '🏪' : isStart ? '📦' : isRoad ? '·' : '🚧';
          const label = !isRoad
            ? `Blocked by roadworks, row ${y + 1}, column ${x + 1}`
            : isGoal
              ? `Shop destination, row ${y + 1}, column ${x + 1}`
              : isCurrent
                ? `Truck location, row ${y + 1}, column ${x + 1}`
                : isStart
                  ? `Depot, row ${y + 1}, column ${x + 1}`
                  : `Road tile, row ${y + 1}, column ${x + 1}`;
          const classes = [
            'rd-delivery-tile',
            isRoad ? 'rd-delivery-tile--road' : 'rd-delivery-tile--blocked',
            isStart ? 'rd-delivery-tile--start' : '',
            isGoal ? 'rd-delivery-tile--goal' : '',
            isCurrent ? 'rd-delivery-tile--current' : ''
          ].filter(Boolean).join(' ');
          const left = (x - y + 3) * 32;
          const top = (x + y) * 20;
          tiles.push(`<button class="${classes}" type="button" data-delivery-pos="${key}" aria-label="${label}"${isCurrent ? ' aria-current="step"' : ''}${!isRoad || solved ? ' disabled' : ''} style="left:${left}px;top:${top}px;z-index:${x + y + 1}"><span class="rd-delivery-tile__icon" aria-hidden="true">${icon}</span></button>`);
        }
      }
      map.innerHTML = tiles.join('');
      map.setAttribute('aria-label', solved ? 'Delivery complete' : 'Isometric delivery map. Follow the open road tiles from the truck to the shop.');
    }

    function setMessage(message, success = false) {
      deliveryStatus.textContent = message;
      deliveryStatus.classList.toggle('is-success', success);
    }

    function completeDelivery() {
      solved = true;
      root.dataset.solved = 'true';
      drawMap();
      setMessage('Delivery complete. The request form is unlocked.', true);
      callbacks.onSolved?.();
    }

    function moveTo(x, y) {
      if (!delivery || solved) return;
      const targetKey = keyOf(x, y);
      if (!delivery.roadCells.has(targetKey)) {
        setMessage('That tile is blocked. Stay on the open road.');
        return;
      }
      const current = currentPosition();
      const distance = Math.abs(x - current[0]) + Math.abs(y - current[1]);
      if (distance !== 1) {
        setMessage('Move one neighboring tile at a time.');
        return;
      }

      const previous = delivery.history[delivery.history.length - 2];
      if (previous && keyOf(previous[0], previous[1]) === targetKey) {
        delivery.history.pop();
      } else if (delivery.history.some(point => keyOf(point[0], point[1]) === targetKey)) {
        setMessage('Retrace your last step to choose another road.');
        return;
      } else {
        delivery.history.push([x, y]);
      }

      drawMap();
      if (targetKey === keyOf(delivery.goal[0], delivery.goal[1])) {
        completeDelivery();
      } else {
        setMessage('Good route. Keep the truck moving toward the shop.');
      }
    }

    function reset() {
      solved = false;
      root.dataset.solved = 'false';
      callbacks.onReset?.();
      delivery = createDelivery();
      drawMap();
      setMessage('Choose a neighboring road tile to start the delivery.');
    }

    map.addEventListener('click', event => {
      const tile = event.target.closest('[data-delivery-pos]');
      if (!tile || !map.contains(tile) || tile.disabled) return;
      const [x, y] = tile.dataset.deliveryPos.split(',').map(Number);
      moveTo(x, y);
    });

    moveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const [dx, dy] = moves[button.dataset.deliveryMove] || [];
        if (Number.isInteger(dx) && Number.isInteger(dy) && delivery) {
          const current = currentPosition();
          moveTo(current[0] + dx, current[1] + dy);
        }
      });
    });

    resetButton?.addEventListener('click', reset);
    if (localNote) {
      localNote.hidden = !(location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    }
    reset();

    return { reset, isSolved: () => solved };
  }

  window.RustyDropDeliveryRoute = { mount };
})();
