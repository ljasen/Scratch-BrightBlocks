## BrightBlocks is an accessible, AI-assisted version of Scratch designed for children who are blind, visually impaired, unable to read, or need alternative ways to learn programming. It identifies and explains coding blocks through speech, helps users understand complete scripts, supports keyboard-based navigation, and provides audio feedback when help is needed. Its goal is to make block-based programming easier to understand, navigate, and create for every learner.

## PS: I also added a set of custom blocks especially useful to make audiospacial games.

## How I Used Codex and GPT-5.6

### Codex

Codex was used during development to:

- Navigate and understand the Scratch editor codebase.
- Identify the components responsible for rendering and interacting with blocks.
- Implement audio feedback when users select or hover over Scratch blocks.
- Add category icons and accessibility-related interface changes.
- Debug integration issues in the customized Scratch editor.
- Assist with code refactoring and documentation.

All generated code was reviewed, tested and adapted before being included in the project.

### GPT-5.6

GPT-5.6 powers the project's AI explanation functionality. It receives
structured information about selected Scratch blocks and produces
age-appropriate explanations of what the code does.

It is used to:

- Explain individual Scratch blocks in simple language.
- Explain sequences of connected blocks.
- Produce explanations suitable for audio playback.
- Help users understand errors or unexpected program behaviour.

API requests are sent through the project's backend so that the OpenAI API key
is never exposed in the browser.

AI Request Flow
1. The child selects a Scratch block or connected group of blocks.
2. The child clicks the help button.
3. The application extracts structured information about the selected code.
4. The backend combines that information with fixed safety and explanation instructions.
5. GPT gives helpful tips to the child trying to make the function work.
6. The explanation is read aloud.

In case child did not find a solution on its own:
7. Child pressed on help button again.
8. GPT generates a clear explanation limited to the selected Scratch code.

No free-text prompt field is available to the child.

## Example AI Workflow


User selects Scratch blocks
        ↓
The project extracts block information
        ↓
The backend sends structured context to GPT-5.6
        ↓
GPT-5.6 generates a child-friendly explanation
        ↓
The explanation is displayed and read aloud

## Whats next?

I will finish the complete keyboard controls integration, then train a specialised agent for the purpose of helping children in Brightblocks. That way it will be much better at its jobs.
****************************************************

# scratch-editor: The Scratch Editor Monorepo

If you'd like to use Scratch, please visit the [Scratch website](https://scratch.mit.edu/). You can build your own
Scratch project by pressing "Create" on that website or by visiting <https://scratch.mit.edu/projects/editor/>.

This is a source code repository for the packages that make up the Scratch editor and a few additional support
packages. Use this if you'd like to learn about how the Scratch editor works or to contribute to its development.

## What's in this repository?

The `packages` directory in this repository contains:

- `scratch-gui` provides the buttons, menus, and other elements that you interact with when creating and editing a
  project. It's also the "glue" that brings most of the other modules together at runtime.
- `scratch-media-lib-scripts` builds (or rebuilds) media libraries for the editor.
- `scratch-paint` provides a way to draw vector (SVG) or bitmap (PNG) images for costumes and backdrops.
- `scratch-render` draws backdrops, sprites, and clones on the stage.
- `scratch-storage` helps load project assets like images and sounds. It also provides `ScratchFetch`, a customized
  wrapper around `fetch`.
- `scratch-svg-renderer` processes SVG (vector) images for use with Scratch projects.
- `scratch-vm` is the virtual machine that runs Scratch projects.
- `task-herder` manages queues of tasks with throttling and concurrency limits.

_Please add to this list as more packages are migrated to the monorepo._

Each package has its own `README.md` file with more information about that package.

## Monorepo migration

### What's going on?

We're migrating the Scratch editor packages into this monorepo. This will allow us to manage all the packages that
make up the Scratch editor in one place, making  it easier to manage dependencies and make changes that affect
multiple packages.

### Why are there only a few packages in this repo?

We're migrating packages in stages. The current plan, which is subject to change, has us migrating repositories in
four batches. We plan to complete the migration within 2025.

### What will happen to the existing repositories?

The existing repositories will be archived and made read-only. Those repositories contain valuable work and
information, including but not limited to issues and pull requests. We plan to keep that information available for
reference, and to selectively migrate it to this new repository.

## Thank you

Scratch would not be what it is today without help from the global community of Scratchers and open-source
contributors. Thank you for your contributions and support. _[Scratch on!](https://scratch.mit.edu/projects/65347738/fullscreen/)_

## Donate

We provide [Scratch](https://scratch.mit.edu) free of charge, and want to keep it that way! Please consider making a
[donation](https://www.scratchfoundation.org/donate) to support our continued engineering, design, community, and
resource development efforts. Donations of any size are appreciated. Thank you!
