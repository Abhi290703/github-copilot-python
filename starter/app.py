from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'medium'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', 'medium')
    puzzle, solution = sudoku_logic.generate_puzzle(difficulty)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty
    return jsonify({
        'puzzle': puzzle,
        'difficulty': difficulty
    })

@app.route('/hint', methods=['POST'])
def get_hint():
    data = request.json or {}
    current_board = data.get('board')
    solution = CURRENT.get('solution')
    
    if not solution:
        return jsonify({'error': 'No game active'}), 400

    empty_or_incorrect = []
    for r in range(sudoku_logic.SIZE):
        for c in range(sudoku_logic.SIZE):
            val = current_board[r][c] if current_board else 0
            if val != solution[r][c]:
                empty_or_incorrect.append((r, c))

    if not empty_or_incorrect:
        return jsonify({'message': 'No hints needed, board already complete/correct'}), 200

    r, c = random_choice = empty_or_incorrect[0]  # Take the first available slot
    return jsonify({
        'row': r,
        'col': c,
        'value': solution[r][c]
    })

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')
    
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
        
    incorrect = []
    is_complete = True
    
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
            if board[i][j] == 0:
                is_complete = False
                
    return jsonify({
        'incorrect': incorrect,
        'solved': len(incorrect) == 0 and is_complete
    })

if __name__ == '__main__':
    app.run(debug=True)
    