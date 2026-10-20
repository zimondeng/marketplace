import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from spec_tools import _instruction_lines


class InstructionLinesTests(unittest.TestCase):
    def test_ignores_managed_and_external_tool_blocks(self):
        text = """
Keep this instruction
<!-- PROJECT-SPECS:START -->
Managed pointer text
<!-- PROJECT-SPECS:END -->
<!-- CODEGRAPH:START -->
CodeGraph text with \"quotes\"
<!-- CODEGRAPH:END -->
# Agent skills
- Skill-managed text
"""

        self.assertEqual(_instruction_lines(text), ["Keep this instruction"])

    def test_agent_skills_block_ends_at_eof(self):
        text = """
Keep this instruction
## Agent skills
Later content owned by the skills tool
"""

        self.assertEqual(_instruction_lines(text), ["Keep this instruction"])

    def test_preserves_text_outside_closed_external_blocks(self):
        text = """
Before the block
<!-- CODEGRAPH:START -->
ignored
<!-- CODEGRAPH:END -->
After the block
"""

        self.assertEqual(_instruction_lines(text), ["Before the block", "After the block"])


if __name__ == "__main__":
    unittest.main()
