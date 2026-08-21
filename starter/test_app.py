import pytest
from app import app
import sudoku_logic

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_index_route(client):
    """Test that the homepage loads successfully."""
    response = client.get('/')
    assert response.status_code == 200

def test_new_game_default(client):
    """Test /new route with default settings."""
    response = client.get('/new')
    assert response.status_code == 200
    data = response.get_json()
    assert 'puzzle' in data
    assert len(data['puzzle']) == 9
    assert len(data['puzzle'][0]) == 9

def test_new_game_difficulties(client):
    """Test /new route across easy, medium, and hard levels."""
    for diff in ['easy', 'medium', 'hard']:
        response = client.get(f'/new?difficulty={diff}')
        assert response.status_code == 200
        data = response.get_json()
        assert data.get('difficulty') == diff

def test_unique_solution_generation():
    """Verify that generated puzzles have exactly one unique solution."""
    puzzle, solution = sudoku_logic.generate_puzzle('easy')
    assert sudoku_logic.count_solutions(puzzle) == 1

def test_hint_endpoint(client):
    """Test /hint provides a valid row, col, and value."""
    client.get('/new?difficulty=easy')
    response = client.post('/hint', json={'board': [[0]*9 for _ in range(9)]})
    assert response.status_code == 200
    data = response.get_json()
    assert 'row' in data
    assert 'col' in data
    assert 'value' in data
    assert 1 <= data['value'] <= 9

def test_check_solution_endpoint(client):
    """Test /check correctly detects board completion and mismatches."""
    client.get('/new?difficulty=easy')
    
    # An empty board should fail / return incorrect cells
    empty_board = [[0]*9 for _ in range(9)]
    response = client.post('/check', json={'board': empty_board})
    assert response.status_code == 200
    data = response.get_json()
    assert data.get('solved') is False