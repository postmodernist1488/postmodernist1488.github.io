#!/usr/bin/env python3

import os
import sys
import shutil

BUILD_DIR = 'build/'
SRC_DIR = 'src/'
TEMPLATE_PATH = os.path.join(SRC_DIR, 'template.html')
CONTENTS_PATH = os.path.join(SRC_DIR, 'contents')
ASSETS_DIR = 'assets/'

def generate_files(template_path, contents_path):

    with open(template_path) as f:
        contents = f.read()

    search_str = '<div id="contents">'
    div_location = contents.find(search_str)
    if div_location == -1:
        return False
    paste_loc = div_location + len(search_str)
    for filename in os.listdir(contents_path):
        path = os.path.join(contents_path, filename)
        with open(path) as f:
            to_paste = f.read()
        with open(BUILD_DIR + '/' + filename, 'w') as f:
            f.write(contents[:paste_loc] + to_paste + contents[paste_loc:])

def main():

    os.chdir(sys.path[0])
    
    if not os.path.exists(BUILD_DIR):
        os.mkdir(BUILD_DIR)
    elif not os.path.isdir(BUILD_DIR):
        print(f'{BUILD_DIR} is not a directory!', file=sys.stderr)
        exit(1)

    generate_files(TEMPLATE_PATH, CONTENTS_PATH)
    for filename in os.listdir(SRC_DIR):
        path = os.path.join(SRC_DIR, filename)
        if path != TEMPLATE_PATH and path != CONTENTS_PATH:
            shutil.copy(path, BUILD_DIR)
    shutil.copytree(ASSETS_DIR, os.path.join(BUILD_DIR, ASSETS_DIR), dirs_exist_ok=True)

if __name__ == "__main__":
    main()
