#!/usr/bin/env python3

from bs4 import BeautifulSoup

import os
import sys
import shutil

BUILD_DIR = 'build/'
SRC_DIR = 'src/'
TEMPLATE_PATH = os.path.join(SRC_DIR, 'template.html')
CONTENTS_PATH = os.path.join(SRC_DIR, 'contents')
ASSETS_DIR = 'assets/'

def generate_files(template_path, contents_path, output_path):

    with open(template_path) as fp:
        soup = BeautifulSoup(fp, 'html.parser')

    sidebar = soup.find('div', id='sidebar')
    contents = soup.find('div', id='contents')

    for a in sidebar.find_all('a'):
        ref = a['href']
        print(f'Generating `{ref}`')

        with open(contents_path + ref) as fp:
            to_insert = BeautifulSoup(fp, 'html.parser')
        
        classes = a.get('class', [])
        classes.append('current')
        a['class'] = classes
        contents.append(to_insert)

        with open(output_path + ref, 'w') as file:
            file.write(str(soup))

        contents.clear()
        a['class'].remove('current')

def main():

    os.chdir(sys.path[0])
    
    if not os.path.exists(BUILD_DIR):
        os.mkdir(BUILD_DIR)
    elif not os.path.isdir(BUILD_DIR):
        print(f'{BUILD_DIR} is not a directory!', file=sys.stderr)
        exit(1)

    generate_files(TEMPLATE_PATH, CONTENTS_PATH, BUILD_DIR)
    for filename in os.listdir(SRC_DIR):
        path = os.path.join(SRC_DIR, filename)
        if path != TEMPLATE_PATH and path != CONTENTS_PATH:
            shutil.copy(path, BUILD_DIR)
    shutil.copytree(ASSETS_DIR, os.path.join(BUILD_DIR, ASSETS_DIR), dirs_exist_ok=True)

if __name__ == "__main__":
    main()
