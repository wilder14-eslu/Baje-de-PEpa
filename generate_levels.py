import json
import random
from collections import deque

class LongcatSolver:
    def __init__(self, w, h, walls, start):
        self.w = w
        self.h = h
        self.walls = set(tuple(p) for p in walls)
        self.start = tuple(start)
        self.walkable = (w * h) - len(self.walls)

    def is_valid(self, x, y, occupied):
        return 0 <= x < self.w and 0 <= y < self.h and (x, y) not in self.walls and (x, y) not in occupied

    def move(self, head, occupied, direction):
        dx, dy = direction
        hx, hy = head
        if not self.is_valid(hx + dx, hy + dy, occupied):
            return None
        cur_x, cur_y = hx, hy
        new_cells = []
        while self.is_valid(cur_x + dx, cur_y + dy, occupied + tuple(new_cells)):
            cur_x += dx
            cur_y += dy
            new_cells.append((cur_x, cur_y))
        return (cur_x, cur_y), occupied + tuple(new_cells)

    def solve(self, max_depth=60):
        start_state = (self.start, (self.start,))
        queue = deque([(start_state, [])])
        visited = { (self.start, frozenset([self.start])) }
        dirs = [('U', (0, -1)), ('D', (0, 1)), ('L', (-1, 0)), ('R', (1, 0))]

        while queue:
            (head, occupied), path = queue.popleft()
            if len(occupied) == self.walkable:
                return path
            if len(path) >= max_depth:
                continue
            for name, d in dirs:
                res = self.move(head, occupied, d)
                if res:
                    n_head, n_occ = res
                    key = (n_head, frozenset(n_occ))
                    if key not in visited:
                        visited.add(key)
                        queue.append((res, path + [name]))
        return None

def is_connected(w, h, walls):
    wall_set = set(tuple(p) for p in walls)
    walkable = [(x, y) for x in range(w) for y in range(h) if (x, y) not in wall_set]
    if not walkable:
        return False
    start = walkable[0]
    visited = {start}
    queue = deque([start])
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in wall_set and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))
    return len(visited) == len(walkable)

def find_level(w, h, num_walls, min_moves=4, max_moves=30):
    all_cells = [(x, y) for x in range(w) for y in range(h)]
    for w_count in range(num_walls, -1, -1):
        for _ in range(800):
            walls = random.sample(all_cells, w_count) if w_count > 0 else []
            if not is_connected(w, h, walls):
                continue
            valid_starts = [c for c in all_cells if c not in walls]
            if not valid_starts:
                continue
            start = random.choice(valid_starts)
            solver = LongcatSolver(w, h, walls, start)
            sol = solver.solve(max_depth=max_moves + 5)
            if sol and len(sol) >= min_moves:
                return {
                    'w': w,
                    'h': h,
                    'walls': [list(p) for p in walls],
                    'start': list(start),
                    'solution': sol,
                    'moves': len(sol),
                    'walkable': solver.walkable
                }
    # If still not found, try smaller dimensions
    if w > 4 or h > 4:
        return find_level(min(w, 5), min(h, 5), max(0, num_walls - 2), min_moves, max_moves)
    return None

random.seed(1337)

all_levels = [
    {
        'id': 1,
        'name': 'El Primer Estiramiento',
        'world': 1,
        'worldName': 'El Jardín Soleado',
        'w': 3,
        'h': 3,
        'walls': [],
        'start': [0, 2],
        'solution': ['U', 'R', 'D', 'L', 'U'],
        'moves': 5,
        'walkable': 9
    }
]

level_specs = [
    # World 1: El Jardín Soleado (Levels 2-10)
    (3, 3, 1, 4, 8),
    (3, 3, 1, 4, 8),
    (4, 3, 0, 5, 9),
    (4, 3, 1, 5, 9),
    (3, 4, 1, 5, 9),
    (4, 3, 2, 5, 9),
    (4, 4, 1, 6, 10),
    (4, 4, 2, 6, 10),
    (4, 4, 2, 6, 11),

    # World 2: La Sala Acogedora (Levels 11-20)
    (4, 4, 1, 6, 11),
    (4, 4, 2, 7, 12),
    (5, 4, 1, 7, 12),
    (5, 4, 2, 7, 12),
    (4, 5, 2, 7, 13),
    (5, 4, 3, 7, 13),
    (5, 4, 3, 8, 14),
    (5, 5, 2, 8, 14),
    (5, 5, 3, 8, 14),
    (5, 5, 3, 8, 15),

    # World 3: Los Tejados al Atardecer (Levels 21-30)
    (5, 5, 2, 8, 15),
    (5, 5, 3, 8, 15),
    (5, 5, 4, 9, 16),
    (5, 5, 4, 9, 16),
    (6, 4, 2, 8, 15),
    (6, 5, 3, 9, 16),
    (5, 6, 3, 9, 16),
    (5, 5, 4, 9, 16),
    (6, 5, 3, 10, 17),
    (6, 5, 4, 10, 17),

    # World 4: El Templo Antiguo (Levels 31-40)
    (6, 5, 3, 10, 17),
    (6, 5, 4, 10, 18),
    (6, 5, 4, 10, 18),
    (6, 5, 5, 11, 18),
    (6, 6, 4, 11, 19),
    (6, 6, 4, 11, 19),
    (6, 6, 5, 11, 20),
    (6, 6, 5, 11, 20),
    (6, 5, 5, 11, 20),
    (6, 6, 5, 11, 20),

    # World 5: El Espacio Estelar (Levels 41-50)
    (6, 6, 4, 11, 22),
    (6, 6, 5, 11, 22),
    (6, 6, 5, 12, 22),
    (6, 6, 6, 12, 23),
    (6, 6, 6, 12, 24),
    (6, 6, 6, 12, 24),
    (6, 6, 7, 12, 25),
    (6, 6, 7, 13, 25),
    (6, 6, 7, 13, 26),
    (6, 6, 8, 13, 26),
]

world_names = [
    (1, 'El Jardín Soleado'),
    (2, 'La Sala Acogedora'),
    (3, 'Los Tejados al Atardecer'),
    (4, 'El Templo Antiguo'),
    (5, 'El Espacio Estelar'),
]

level_id = 2
for idx, (w, h, walls_cnt, min_m, max_m) in enumerate(level_specs):
    world_num = (level_id - 1) // 10 + 1
    world_name = world_names[world_num - 1][1]
    lvl = find_level(w, h, walls_cnt, min_m, max_m)
    lvl['id'] = level_id
    lvl['name'] = f'Nivel {level_id}'
    lvl['world'] = world_num
    lvl['worldName'] = world_name
    all_levels.append(lvl)
    w_cnt = len(lvl['walls'])
    m_cnt = lvl['moves']
    s_part = lvl['solution'][:6]
    lw = lvl['w']
    lh = lvl['h']
    print(f'Level {level_id} (World {world_num} - {world_name}): {lw}x{lh}, walls={w_cnt}, moves={m_cnt}')
    level_id += 1

with open('levels.json', 'w', encoding='utf-8') as f:
    json.dump(all_levels, f, indent=2)

print(f'\nSuccessfully generated and verified all {len(all_levels)} levels into levels.json!')
