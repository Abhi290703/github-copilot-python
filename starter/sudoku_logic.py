import copy
import random

SIZE = 9
EMPTY = 0

DIFFICULTY_LEVELS = {
    'easy': 38,      # More filled cells
    'medium': 30,    # Moderate filled cells
    'hard': 24       # Fewer filled cells
}

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def count_solutions(board):
    """Backtracking solver to count solutions. Stops if > 1 solution exists."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                count = 0
                for num in range(1, SIZE + 1):
                    if is_safe(board, row, col, num):
                        board[row][col] = num
                        count += count_solutions(board)
                        board[row][col] = EMPTY
                        if count > 1:
                            return count
                return count
    return 1

def remove_cells_unique(board, target_clues):
    """Removes cells while ensuring exactly one unique solution remains."""
    positions = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(positions)
    
    current_clues = SIZE * SIZE
    for r, c in positions:
        if current_clues <= target_clues:
            break
        temp = board[r][c]
        board[r][c] = EMPTY
        
        board_copy = deep_copy(board)
        if count_solutions(board_copy) != 1:
            board[r][c] = temp  # Put back if removing creates multiple solutions
        else:
            current_clues -= 1

def generate_puzzle(difficulty='medium'):
    clues = DIFFICULTY_LEVELS.get(difficulty.lower(), 30)
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells_unique(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution