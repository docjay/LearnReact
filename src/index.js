import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const className = props.isHighlighted ?
    "square winningSquare" : "square";
  return (
      <button 
        className={className} 
        onClick={props.onClick}
      >
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  renderSquare(i, isHighlighted) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isHighlighted={isHighlighted}
      />
    );
  }

  render() {
    let board = [];
    for (let i = 0; i < 3; i++) {
      let squares = [];
      for (let j = 0; j < 3; j++) {
        const value = i*3 + j;
        const isHighlighted = this.props.highlightedSquares && (this.props.highlightedSquares.indexOf(value) !== -1);
        squares.push(this.renderSquare(value, isHighlighted));
      }
      board.push(<div key={i} className="board-row">{squares}</div>);
    }

    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const xIsNext = Math.floor(Math.random() * 2) > 0;
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: null,
      }],
      xIsNext: xIsNext,
      stepNumber: 0,
      historyAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares).winner || squares[i]) { 
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: {
          col: i % 3,
          row: Math.floor(i / 3),
        }
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  reverseHistoryOrder() {
    this.setState({
      historyAscending: !this.state.historyAscending
    });
  }

  resetGame() {
    const xIsNext = Math.floor(Math.random() * 2) > 0;
    this.setState({
      history: [{
        squares: Array(9).fill(null),
        location: null,
      }],
      xIsNext: xIsNext,
      stepNumber: 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const { winner, locations } = calculateWinner(current.squares);
    const isDraw = calculateDraw(current.squares);

    let moves = history.map((step, move) => {
      const desc = (move > 0) ?
        'Go to move #' + move :
        'Go to game start';
      const location = (move > 0) ?
        '(' + step.location.col + ', ' + step.location.row + ')' :
        '';
      const className = (this.state.stepNumber === move) ?
        'selectedItem' : '';
      
      return (
        <li key={move} className={className}>
          <button onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
          <br />{location}
        </li>
      );
    });

    if (!this.state.historyAscending) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (isDraw) {
      status = 'It\'s a tie!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            highlightedSquares={locations}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reverseHistoryOrder()}>
            Reverse History
          </button>
          <button onClick={() => this.resetGame()}>
            Reset Game
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateDraw(squares) {
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      return false;
    }
  }
  return true;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], locations: [a, b, c]};
    }
  }
  return { winner: null, locations: null };
}