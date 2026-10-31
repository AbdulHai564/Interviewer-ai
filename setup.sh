#!/bin/bash
mkdir -p graph/nodes tools db data/companies prompts
touch graph/__init__.py graph/nodes/__init__.py tools/__init__.py db/__init__.py
touch graph/state.py graph/builder.py
touch graph/nodes/recruiter.py graph/nodes/technical.py graph/nodes/coding.py graph/nodes/evaluation.py
touch tools/tools.py
touch db/models.py
touch prompts/interviewer.py prompts/evaluator.py
touch api.py app.py
echo "✅ Project structure created!"
